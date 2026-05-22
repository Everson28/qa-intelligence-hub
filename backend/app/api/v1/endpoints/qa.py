from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Header, Form
from sqlmodel import select, Session
from typing import Dict, Any, List
import httpx
import os
from bs4 import BeautifulSoup
import pandas as pd
import io

from app.db.database import get_session
from app.db.models import Report, User, Bug, DataMigration
from app.schemas.models import (
    RequirementRequest,
    ScriptRequest,
    AuditRequest,
    QualityStrategyRequest,
    DataGenRequest,
    ApiTestRequest,
    FunctionalTestRequest
)
from app.core.engine import engine
from app.core.prompts import get_localized_prompt
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

async def get_lang(accept_language: str = Header(None)):
    if not accept_language: return "en"
    return "es" if accept_language.startswith("es") else "en"

def save_report(session: Session, type: str, title: str, content: str, user_id: int, project: str = "General", source: str = None):
    report = Report(type=type, title=title, content=content, project=project, source=source, user_id=user_id)
    session.add(report)
    session.commit()
    return report

@router.post("/analyze-requirements")
async def analyze_requirements(req: RequirementRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    template = get_localized_prompt(lang, "requirements")
    prompt = template["prompt"].format(user_story=req.user_story)
    result = await engine.query(prompt, system=template["system"], task_type="requirements")
    save_report(session, "requirements", f"Req: {req.user_story[:30]}", result, current_user.id, project=req.project)
    return {"status": "success", "data": result}

@router.post("/generate-script")
async def generate_script(req: ScriptRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    template = get_localized_prompt(lang, "scripts")
    prompt = template["prompt"].format(description=req.description)
    result = await engine.query(prompt, system=template["system"], task_type="scripts")
    save_report(session, "script", f"Script: {req.description[:30]}", result, current_user.id, project=req.project)
    return {"status": "success", "data": result}

@router.post("/quality-strategy")
async def quality_strategy(req: QualityStrategyRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    template = get_localized_prompt(lang, "strategy")
    prompt = template["prompt"].format(project_description=req.project_description, tech_stack=req.tech_stack or "Not specified", focus_areas=", ".join(req.focus_areas) if req.focus_areas else "General")
    result = await engine.query(prompt, system=template["system"], task_type="strategy")
    save_report(session, "strategy", f"Strategy: {req.project_description[:30]}", result, current_user.id, project=req.project)
    return {"status": "success", "data": result}

@router.post("/generate-data")
async def generate_data(req: DataGenRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    template = get_localized_prompt(lang, "data_gen")
    prompt = template["prompt"].format(count=req.count, format=req.format, structure=req.structure)
    result = await engine.query(prompt, system=template["system"], task_type="data_gen")
    save_report(session, "data", "Generación de Datos", result, current_user.id, project=req.project)
    return {"status": "success", "data": result}

@router.post("/generate-snowflake-sql")
async def generate_snowflake_sql(
    file: UploadFile = File(...), 
    instructions: str = Form(None),
    project: str = Form("General"),
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user), 
    lang: str = Depends(get_lang)
):
    content = await file.read()
    filename = file.filename
    
    try:
        if filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content), nrows=5)
        else:
            df = pd.read_excel(io.BytesIO(content), nrows=5)
        structure = df.dtypes.to_dict()
        structure_str = ", ".join([f"{k}: {v}" for k, v in structure.items()])
    except Exception:
        structure_str = "No se pudo determinar la estructura automáticamente."

    template = get_localized_prompt(lang, "snowflake")
    prompt = template["prompt"].format(filename=filename, structure=structure_str)
    
    if instructions:
        prompt += f"\n\nINSTRUCCIONES ADICIONALES DEL USUARIO: {instructions}"
    
    result = await engine.query(prompt, system=template["system"], task_type="snowflake")
    save_report(session, "snowflake", f"Snowflake: {filename}", result, current_user.id, project=project)
    return {"status": "success", "data": result}

@router.post("/generate-migration-tests")
async def generate_migration_tests(
    file: UploadFile = File(...), 
    project: str = Form("General"),
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user), 
    lang: str = Depends(get_lang)
):
    content = await file.read()
    filename = file.filename
    
    try:
        if filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content), nrows=5)
        else:
            df = pd.read_excel(io.BytesIO(content), nrows=5)
        structure = ", ".join([f"{k} ({v})" for k, v in df.dtypes.to_dict().items()])
    except Exception:
        structure = "Estructura desconocida"

    template = get_localized_prompt(lang, "migration_tests")
    prompt = template["prompt"].format(filename=filename, structure=structure)
    
    result = await engine.query(prompt, system=template["system"], task_type="migration_tests")
    save_report(session, "migration_test", f"QA Tests: {filename}", result, current_user.id, project=project)
    return {"status": "success", "data": result}

@router.post("/api-test-gen")
async def api_test_gen(req: ApiTestRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    template = get_localized_prompt(lang, "api_test")
    prompt = template["prompt"].format(endpoint_info=req.endpoint_info, response_sample=req.response_sample or "None")
    result = await engine.query(prompt, system=template["system"], task_type="api_test")
    save_report(session, "api_test", f"API Suite: {req.endpoint_info[:30]}", result, current_user.id)
    return {"status": "success", "data": result}

@router.post("/white-box-audit")
async def white_box_audit(req: Dict[str, str], session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    template = get_localized_prompt(lang, "white_box")
    prompt = template["prompt"].format(code_content=req.get('code_content')[:2000])
    result = await engine.query(prompt, system=template["system"], task_type="white_box")
    save_report(session, "whitebox", "Caja Blanca", result, current_user.id)
    return {"status": "success", "data": result}

@router.post("/accessibility-audit")
async def accessibility_audit(req: AuditRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    content = req.code_content or ""
    if req.url:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(req.url, timeout=10)
                content = res.text
        except Exception: pass
    template = get_localized_prompt(lang, "accessibility")
    prompt = template["prompt"].format(content=content[:1500])
    result = await engine.query(prompt, system=template["system"], task_type="accessibility")
    save_report(session, "accessibility", "Auditoría Accesibilidad", result, current_user.id)
    return {"status": "success", "data": result}

@router.post("/audit-url")
async def audit_url(req: AuditRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    content = req.code_content or ""
    if req.url:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(req.url, timeout=10)
                content = res.text
        except Exception: pass
    template = get_localized_prompt(lang, "audit")
    soup = BeautifulSoup(content, 'html.parser')
    for s in soup(["script", "style"]): s.decompose()
    clean_text = soup.get_text(separator=' ')[:1500]
    prompt = template["prompt"].format(content=clean_text)
    result = await engine.query(prompt, system=template["system"], task_type="audit")
    save_report(session, "audit", f"SEO Audit: {req.url or 'Code'}", result, current_user.id)
    return {"status": "success", "data": result}

@router.post("/functional-test")
async def functional_test(req: FunctionalTestRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(req.url, timeout=10)
            content = res.text
    except Exception as e: raise HTTPException(400, str(e))
    template = get_localized_prompt(lang, "functional")
    soup = BeautifulSoup(content, 'html.parser')
    for s in soup(["script", "style"]): s.decompose()
    clean_content = soup.get_text(separator=' ')[:2000]
    prompt = template["prompt"].format(url=req.url, content=clean_content)
    result = await engine.query(prompt, system=template["system"], task_type="functional")
    save_report(session, "functional", f"Simulación QA Pro: {req.url}", result, current_user.id)
    return {"status": "success", "data": result}

@router.post("/validate-ai-change")
async def validate_ai_change(req: Dict[str, str], session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    template = get_localized_prompt(lang, "validation")
    prompt = template["prompt"].format(original=req.get('original_code')[:1000], ai=req.get('ai_code')[:1000])
    result = await engine.query(prompt, system=template["system"], task_type="validation")
    save_report(session, "validation", "Validación Cambio IA", result, current_user.id)
    return {"status": "success", "data": result}

@router.post("/regression-detector")
async def regression_detector(req: Dict[str, str], session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    template = get_localized_prompt(lang, "regression")
    prompt = template["prompt"].format(original=req.get("original_code")[:1500], new_code=req.get("new_code")[:1500])
    result = await engine.query(prompt, system=template["system"], task_type="regression")
    save_report(session, "regression", "Regresión IA", result, current_user.id)
    return {"status": "success", "data": result}

@router.post("/chat")
async def qa_copilot(req: Dict[str, Any], session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    message = req.get("message")
    history = req.get("history", [])
    chat_context = "".join([f"{'Usuario' if m['role']=='user' else 'Asistente'}: {m['content']}\n" for m in history])
    template = get_localized_prompt(lang, "copilot")
    prompt = template["prompt"].format(open_bugs=0, reports=[], message=f"CONTEXTO:\n{chat_context}\nNUEVA PREGUNTA: {message}")
    response = await engine.query(prompt, system=template["system"], task_type="copilot")
    return {"status": "success", "data": response}

@router.get("/oracle/verdict")
async def get_oracle_verdict(project: str = "General", session: Session = Depends(get_session), current_user: User = Depends(get_current_user), lang: str = Depends(get_lang)):
    try:
        bugs = session.exec(select(Bug).where(Bug.user_id == current_user.id, Bug.project == project)).all()
        critical_count = len([b for b in bugs if b.severity in ["Critical", "High", "Crítico", "Alta"] and b.status != "Closed"])
        
        template = get_localized_prompt(lang, "oracle")
        prompt = f"PROYECTO: {project}\n" + template["prompt"].format(total_bugs=len(bugs), critical_bugs=critical_count)
        
        verdict = await engine.query(prompt, system=template["system"], task_type="oracle")
        
        if not verdict or "Error crítico" in verdict:
            if critical_count == 0:
                verdict = f"[VERDICT: GO] - El proyecto '{project}' está estable. No se detectan bloqueadores críticos."
            else:
                verdict = f"[VERDICT: NO-GO] - El proyecto '{project}' tiene {critical_count} defectos críticos activos."
        
        return {"status": "success", "data": verdict}
    except Exception:
        return {"status": "error", "data": "El Oráculo está meditando. Por favor, reintente en unos momentos."}

@router.get("/projects")
async def list_projects(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    report_projects = session.exec(select(Report.project).where(Report.user_id == current_user.id)).all()
    bug_projects = session.exec(select(Bug.project).where(Bug.user_id == current_user.id)).all()
    migration_projects = session.exec(select(DataMigration.project).where(DataMigration.user_id == current_user.id)).all()
    
    unique_projects = list(set(report_projects + bug_projects + migration_projects))
    if "General" not in unique_projects:
        unique_projects.append("General")
    
    return sorted(unique_projects)

@router.get("/history", response_model=List[Report])
async def get_history(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(select(Report).where(Report.user_id == current_user.id).order_by(Report.created_at.desc())).all()

@router.get("/search")
async def universal_search(q: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    reports = session.exec(select(Report).where(Report.user_id == current_user.id, Report.title.contains(q))).all()
    bugs = session.exec(select(Bug).where(Bug.user_id == current_user.id, Bug.title.contains(q))).all()
    migrations = session.exec(select(DataMigration).where(DataMigration.user_id == current_user.id, DataMigration.filename.contains(q))).all()
    results = []
    for r in reports: results.append({"id": r.id, "type": "report", "title": r.title, "category": r.type})
    for b in bugs: results.append({"id": b.id, "type": "bug", "title": b.title, "category": b.severity})
    for m in migrations: results.append({"id": m.id, "type": "migration", "title": m.filename, "category": m.source_type})
    return results

# --- AI Integration Check ---

@router.get("/ai-status")
async def get_ai_status(session: Session = Depends(get_session)):
    """Versión mejorada: Revisa si hay proveedores Cloud activos antes de marcar Offline"""
    from app.db.models import AIProvider
    cloud_active = session.exec(select(AIProvider).where(AIProvider.is_active == True, AIProvider.is_cloud == True)).first()
    
    if cloud_active:
        return {"status": "Online", "engine": cloud_active.name}
    
    # Si no hay cloud, revisamos Ollama local
    try:
        async with httpx.AsyncClient() as client:
            target_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            res = await client.get(f"{target_url}/api/tags", timeout=2.0)
            if res.status_code == 200:
                return {"status": "Online", "engine": "Ollama (Local)"}
    except Exception:
        pass

    return {"status": "Offline", "engine": "None"}
