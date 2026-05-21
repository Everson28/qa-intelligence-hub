import os
from sqlmodel import SQLModel, create_engine, Session

# Prioridad absoluta a la variable de entorno del sistema (Render/Nube)
DATABASE_URL = os.environ.get("DATABASE_URL")

# Si no existe en el sistema, buscamos en el archivo local (Solo para desarrollo)
if not DATABASE_URL:
    from dotenv import load_dotenv
    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./qa_hub.db")

# Configuración de argumentos según el motor
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif DATABASE_URL.startswith("postgresql"):
    # Render/Supabase necesitan SSL activo
    connect_args = {}

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

