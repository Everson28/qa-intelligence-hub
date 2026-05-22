import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

# Cargar variables de entorno desde .env si existe (Desarrollo)
load_dotenv()

# Prioridad absoluta a la variable de entorno del sistema (Render/Nube)
DATABASE_URL = os.environ.get("DATABASE_URL")

# Render y otros proveedores usan postgres:// pero SQLAlchemy requiere postgresql://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Si no existe en el sistema, usamos un default que funcione en Docker
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///qa_hub.db"

# Configuración de argumentos según el motor
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif DATABASE_URL.startswith("postgresql"):
    # Render/Supabase necesitan SSL activo
    # Si no viene en la URL, se puede forzar en connect_args
    if "sslmode" not in DATABASE_URL:
        connect_args = {"sslmode": "require"}

engine = create_engine(
    DATABASE_URL, 
    connect_args=connect_args,
    pool_pre_ping=True,  # Verifica que la conexión esté viva antes de usarla
    pool_recycle=300     # Recicla conexiones cada 5 min para evitar timeouts
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

