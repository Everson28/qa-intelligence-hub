from fastapi import APIRouter
from app.api.v1.endpoints import auth, admin, qa, bugs, jobs

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(qa.router, prefix="", tags=["qa"])
api_router.include_router(bugs.router, prefix="/bugs", tags=["bugs"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
