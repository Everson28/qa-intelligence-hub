from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select, Session
from typing import List
import os
import shutil

from app.db.database import get_session
from app.db.models import User
from app.schemas.models import UserCreate, UserUpdate, UserResponse, Token
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Directorios de sistema
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
AVATARS_DIR = os.path.join(BASE_DIR, "static", "avatars")

if not os.path.exists(AVATARS_DIR):
    os.makedirs(AVATARS_DIR)

async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No se pudo validar sesión")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise credentials_exception
    return user

async def check_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return current_user

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.username == user_data.username)).first():
        raise HTTPException(400, "Usuario ya existe")
    
    is_first = len(session.exec(select(User)).all()) == 0
    new_user = User(
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        role="admin" if is_first else user_data.role,
        preferred_lang=user_data.preferred_lang or "en"
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(401, "Credenciales incorrectas")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/profile")
async def update_profile(
    data: UserUpdate, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    for key, value in data.dict(exclude_unset=True).items():
        setattr(current_user, key, value)
    session.add(current_user)
    session.commit()
    return {"status": "success"}

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    ext = file.filename.split('.')[-1]
    avatar_name = f"avatar_{current_user.id}.{ext}"
    path = os.path.join(AVATARS_DIR, avatar_name)
    
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    current_user.avatar_url = f"/static/avatars/{avatar_name}"
    session.add(current_user)
    session.commit()
    return {"avatar_url": current_user.avatar_url}
