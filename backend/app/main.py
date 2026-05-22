import os
import uvicorn
import sys
import tempfile
import subprocess
import httpx

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import select, Session
from contextlib import asynccontextmanager

from app.db.database import create_db_and_tables, get_session
from app.db.models import User, SystemConfig, AIProvider, Report, Bug, AIQueryLog
from app.api.v1.api import api_router
from app.api.v1.endpoints.auth import get_current_user


# =========================
# DIRECTORIOS
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
AVATARS_DIR = os.path.join(BASE_DIR, "static", "avatars")
STATIC_DIR = os.path.join(BASE_DIR, "static")

for d in [REPORTS_DIR, AVATARS_DIR]:
    os.makedirs(d, exist_ok=True)


# =========================
# LIFESPAN
# =========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        create_db_and_tables()
        print("DB initialized successfully")
    except Exception as e:
        print("DB init error:", str(e))

    session = None
    try:
        session = next(get_session())
        # Seed Ollama provider
        if not session.exec(
            select(AIProvider).where(AIProvider.name == "Ollama (Local)")
        ).first():

            ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            ollama_model = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")

            ollama = AIProvider(
                name="Ollama (Local)",
                base_url=ollama_url,
                is_active=True,
                is_cloud=False,
                default_model=ollama_model
            )
            session.add(ollama)

        # Seed global config
        if not session.get(SystemConfig, "GLOBAL_ANNOUNCEMENT"):
            session.add(
                SystemConfig(
                    key="GLOBAL_ANNOUNCEMENT",
                    value="Bienvenido al QA Intelligence Hub Pro. La plataforma está operativa.",
                    description="Mensaje global del sistema"
                )
            )

        session.commit()

    except Exception as e:
        print("Seed error:", str(e))
        if session:
            session.rollback()
    finally:
        if session:
            session.close()

    yield


# =========================
# APP
# =========================
app = FastAPI(
    title="QA Intelligence Hub Pro",
    description="Enterprise-grade QA AI Orchestrator.",
    version="1.3.0",
    lifespan=lifespan
)


# =========================
# MIDDLEWARE
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# STATIC FILES
# =========================
app.mount("/reports", StaticFiles(directory=REPORTS_DIR), name="reports")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# =========================
# ROUTES
# =========================
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "QA Intelligence Hub API running",
        "version": "1.3.0"
    }


@app.get("/api/v1/system/health")
async def get_system_health(session: Session = Depends(get_session)):
    import httpx

    db_status = "Online"
    ai_status = "Online"

    try:
        session.exec(select(User).limit(1)).all()
    except Exception:
        db_status = "Offline"

    cloud_active = session.exec(
        select(AIProvider).where(
            AIProvider.is_active == True,
            AIProvider.is_cloud == True
        )
    ).first()

    if not cloud_active:
        try:
            async with httpx.AsyncClient() as client:
                target_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
                res = await client.get(f"{target_url}/api/tags", timeout=2.0)
                if res.status_code != 200:
                    ai_status = "Issues"
        except Exception:
            ai_status = "Offline"

    return {
        "api": "Online",
        "database": db_status,
        "ai_engine": ai_status,
        "timestamp": os.popen("date /t").read().strip() if os.name == "nt"
        else os.popen("date").read().strip()
    }


@app.get("/api/v1/dashboard/stats")
async def get_dashboard_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    from app.db.models import DataMigration

    bugs = session.exec(select(Bug).where(Bug.user_id == current_user.id)).all()
    open_bugs = [b for b in bugs if b.status != "Closed"]

    critical_bugs = len([
        b for b in open_bugs
        if b.severity in ["Critical", "High", "Crítico", "Alta"]
    ])

    migrations = session.exec(
        select(DataMigration).where(DataMigration.user_id == current_user.id)
    ).all()

    total_records = sum(m.records_count for m in migrations)

    return {
        "bug_stats": {
            "total": len(bugs),
            "critical": critical_bugs
        },
        "migration_stats": {
            "total_files": len(migrations),
            "total_records": total_records
        },
        "reports_count": len(
            session.exec(
                select(Report).where(Report.user_id == current_user.id)
            ).all()
        ),
        "health_score": 100,
        "status": "Healthy"
    }


@app.get("/api/v1/dashboard/analytics")
async def get_dashboard_analytics(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    logs = session.exec(
        select(AIQueryLog)
        .order_by(AIQueryLog.created_at.desc())
        .limit(20)
    ).all()

    return [
        {
            "name": l.created_at.strftime("%H:%M"),
            "duration": l.duration_ms,
            "prompt": l.prompt_length,
            "response": l.response_length
        }
        for l in reversed(logs)
    ]


@app.get("/api/v1/announcements")
async def get_announcements(session: Session = Depends(get_session)):
    config = session.get(SystemConfig, "GLOBAL_ANNOUNCEMENT")
    return {"message": config.value if config else None}


@app.post("/api/v1/execute-script")
async def execute_script(req: dict, current_user: User = Depends(get_current_user)):
    raw_code = req.get("code")
    if not raw_code:
        raise HTTPException(400, "No code provided")

    code = raw_code

    if "```python" in raw_code:
        code = raw_code.split("```python")[1].split("```")[0].strip()
    elif "```" in raw_code:
        code = raw_code.split("```")[1].split("```")[0].strip()

    with tempfile.NamedTemporaryFile(
        suffix=".py",
        delete=False,
        mode="w",
        encoding="utf-8"
    ) as tf:
        tf.write(code)
        temp_path = tf.name

    try:
        result = subprocess.run(
            [sys.executable, temp_path],
            capture_output=True,
            text=True,
            timeout=60
        )

        output = result.stdout + "\n" + result.stderr

        return {
            "status": "success",
            "data": output or "Ejecución finalizada sin salida de consola."
        }

    except subprocess.TimeoutExpired:
        return {"status": "error", "data": "Error: Tiempo de ejecución excedido (60s)"}

    except Exception as e:
        return {"status": "error", "data": f"Error de sistema: {str(e)}"}

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 10000))
    )