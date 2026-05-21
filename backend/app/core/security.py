import os
from datetime import datetime, timedelta
from typing import Optional, Any, Union
from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
from cryptography.fernet import Fernet

load_dotenv()

# Configuración
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-for-dev-only")
# Derivamos una clave para Fernet de la SECRET_KEY (debe ser de 32 bytes y base64)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    # Solo para desarrollo, en prod fallará si no está definida
    ENCRYPTION_KEY = "7S6_I8S3M2vX_UvL_XJp9hD_S9D8hD1vV_UvL_XJp9h="

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 horas

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
fernet = Fernet(ENCRYPTION_KEY)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Vault (Bóveda de Secretos) ---

def encrypt_secret(text: str) -> str:
    if not text: return None
    return fernet.encrypt(text.encode()).decode()

def decrypt_secret(token: str) -> str:
    if not token: return None
    return fernet.decrypt(token.encode()).decode()
