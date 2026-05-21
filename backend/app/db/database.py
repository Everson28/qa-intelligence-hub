import os
from sqlmodel import SQLModel, create_engine, Session

# Directorio base del proyecto (donde está qa_hub.db en la raíz)
# backend/app/db/database.py -> backend/app/db (1) -> backend/app (2) -> backend (3) -> root (4)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
db_path = os.path.join(BASE_DIR, "qa_hub.db")

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

# Connect args solo son necesarios para SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
