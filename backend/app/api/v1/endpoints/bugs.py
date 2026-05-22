from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import select, Session
from typing import List
from datetime import datetime
import pandas as pd
import io

from app.db.database import get_session
from app.db.models import Bug, User
from app.schemas.models import BugReportRequest
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.post("")
async def create_bug(req: BugReportRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    new_bug = Bug(**req.dict(), user_id=current_user.id)
    session.add(new_bug)
    session.commit()
    return {"status": "success"}

@router.get("", response_model=List[Bug])
async def list_bugs(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(select(Bug).where(Bug.user_id == current_user.id)).all()

@router.get("/export")
async def export_bugs(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    bugs = session.exec(select(Bug).where(Bug.user_id == current_user.id)).all()
    
    # Convertir lista de objetos Bug a DataFrame
    bug_data = [b.dict() for b in bugs]
    df = pd.DataFrame(bug_data)
    
    # Limpieza de datos internos si hay registros
    if not df.empty:
        cols_to_drop = ['user_id', 'id']
        df = df.drop(columns=[c for c in cols_to_drop if c in df.columns])
    
    # Crear stream CSV
    stream = io.StringIO()
    df.to_csv(stream, index=False, encoding='utf-8-sig') # sig para compatibilidad con Excel (BOM)
    
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f"attachment; filename=bugs_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return response
