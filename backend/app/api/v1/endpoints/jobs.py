from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlmodel import Session
import json

from app.db.database import get_session, engine as db_engine
from app.db.models import BackgroundJob, DataMigration, User
from app.core.reporting import process_migration_file
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

def background_migration_task(job_id: int, file_content: bytes, filename: str, user_id: int):
    with Session(db_engine) as session:
        job = session.get(BackgroundJob, job_id)
        if not job: return
        try:
            job.status = "processing"; job.progress = 10; session.add(job); session.commit()
            result = process_migration_file(file_content, filename)
            job.progress = 90; session.add(job); session.commit()
            
            migration = DataMigration(
                filename=filename, 
                source_type=filename.split('.')[-1], 
                records_count=result["records_count"], 
                pdf_path=result["pdf_path"], 
                user_id=user_id
            )
            session.add(migration)
            
            job.status = "completed"
            job.progress = 100
            job.result = json.dumps({
                "records_count": result["records_count"], 
                "pdf_path": result["pdf_path"],
                "xlsx_path": result["xlsx_path"],
                "csv_path": result["csv_path"],
                "insights": result["insights"]
            })
            session.add(job); session.commit()
        except Exception as e:
            job.status = "failed"; job.error = str(e); session.add(job); session.commit()

@router.post("/migrate-data")
async def migrate_data(background_tasks: BackgroundTasks, file: UploadFile = File(...), session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    content = await file.read()
    job = BackgroundJob(type="migration", status="pending", user_id=current_user.id)
    session.add(job); session.commit(); session.refresh(job)
    background_tasks.add_task(background_migration_task, job.id, content, file.filename, current_user.id)
    return {"status": "success", "job_id": job.id}

@router.get("/{job_id}")
async def get_job(job_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    job = session.get(BackgroundJob, job_id)
    if not job or job.user_id != current_user.id: raise HTTPException(404)
    return job
