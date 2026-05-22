from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, Session
from typing import List
from datetime import datetime

from app.db.database import get_session
from app.db.models import User, AIProvider, AIRouting, Report, Bug, SystemConfig
from app.schemas.models import AIProviderCreate, AIProviderResponse, AIRoutingUpdate, UserResponse
from app.core.security import encrypt_secret
from app.api.v1.endpoints.auth import get_current_user, check_admin

router = APIRouter()

# --- Intelligence Router Admin ---

@router.get("/ai/providers", response_model=List[AIProviderResponse])
async def list_providers(admin: User = Depends(check_admin), session: Session = Depends(get_session)):
    return session.exec(select(AIProvider)).all()

@router.post("/ai/providers")
async def create_provider(
    data: AIProviderCreate, 
    admin: User = Depends(check_admin), 
    session: Session = Depends(get_session)
):
    provider = AIProvider(
        name=data.name,
        base_url=data.base_url,
        api_key=encrypt_secret(data.api_key),
        is_cloud=data.is_cloud,
        default_model=data.default_model
    )
    session.add(provider)
    session.commit()
    return {"status": "success"}

@router.patch("/ai/providers/{pid}/activate")
async def activate_provider(pid: int, admin: User = Depends(check_admin), session: Session = Depends(get_session)):
    provider = session.get(AIProvider, pid)
    if not provider: raise HTTPException(404)
    others = session.exec(select(AIProvider).where(AIProvider.id != pid)).all()
    for p in others: p.is_active = False
    provider.is_active = True
    session.add(provider)
    session.commit()
    return {"status": "success"}

@router.post("/ai/routing")
async def update_routing(
    data: AIRoutingUpdate, 
    admin: User = Depends(check_admin), 
    session: Session = Depends(get_session)
):
    routing = session.get(AIRouting, data.task_type)
    if not routing:
        routing = AIRouting(task_type=data.task_type, provider_id=data.provider_id)
    else:
        routing.provider_id = data.provider_id
    session.add(routing)
    session.commit()
    return {"status": "success"}

# --- Admin User Management ---

@router.get("/users", response_model=List[UserResponse])
async def admin_list_users(session: Session = Depends(get_session), admin: User = Depends(check_admin)):
    return session.exec(select(User)).all()

@router.patch("/users/{user_id}/role")
async def admin_update_user_role(user_id: int, new_role: str, session: Session = Depends(get_session), admin: User = Depends(check_admin)):
    user = session.get(User, user_id)
    if not user: raise HTTPException(404, "Usuario no encontrado")
    user.role = new_role
    session.add(user)
    session.commit()
    return {"status": "success"}

@router.delete("/users/{user_id}")
async def admin_delete_user(user_id: int, session: Session = Depends(get_session), admin: User = Depends(check_admin)):
    user = session.get(User, user_id)
    if not user: raise HTTPException(404, "Usuario no encontrado")
    if user.id == admin.id: raise HTTPException(400, "No puedes eliminarte a ti mismo")
    session.delete(user)
    session.commit()
    return {"status": "success"}

@router.get("/audit-log")
async def admin_audit_log(session: Session = Depends(get_session), admin: User = Depends(check_admin)):
    reports = session.exec(select(Report).order_by(Report.created_at.desc()).limit(50)).all()
    audit_data = []
    for r in reports:
        u = session.get(User, r.user_id)
        audit_data.append({
            "id": r.id, "type": r.type, "title": r.title,
            "user": u.username if u else "Unknown", "created_at": r.created_at
        })
    return audit_data

@router.get("/ai/logs")
async def admin_ai_logs(session: Session = Depends(get_session), admin: User = Depends(check_admin)):
    from app.db.models import AIQueryLog
    return session.exec(select(AIQueryLog).order_by(AIQueryLog.created_at.desc()).limit(100)).all()

@router.get("/system-status")
async def admin_system_status(session: Session = Depends(get_session), admin: User = Depends(check_admin)):
    return {
        "database": "aiosqlite (Enterprise)",
        "ai_engine": "QA Intelligence Router",
        "reports_total": len(session.exec(select(Report)).all()),
        "bugs_total": len(session.exec(select(Bug)).all()),
        "uptime": "100%"
    }
