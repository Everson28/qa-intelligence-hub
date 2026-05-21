from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str  # requirements, script, audit, security, etc.
    title: str
    content: str
    project: str = Field(default="General", index=True) # Nombre del proyecto
    created_at: datetime = Field(default_factory=datetime.utcnow)
    source: Optional[str] = None # URL or filename
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    
    user: Optional["User"] = Relationship(back_populates="reports")

class Bug(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    severity: str # Low, Medium, High, Critical
    priority: str = Field(default="Medium") # Low, Medium, High, Urgente
    status: str = Field(default="Open") # Open, In Progress, Fixed, Verified, Closed
    project: str = Field(default="General", index=True) # Nombre del proyecto
    environment: str
    steps: str
    expected: str
    actual: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    
    user: Optional["User"] = Relationship(back_populates="bugs")

class DataMigration(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str
    project: str = Field(default="General", index=True) # Nombre del proyecto
    source_type: str # Excel, CSV, Access
    records_count: int
    status: str = Field(default="Completed")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    pdf_path: Optional[str] = None
    
    user: Optional["User"] = Relationship(back_populates="migrations")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default="user") # "user", "admin", "lead", "viewer"
    is_active: bool = Field(default=True)
    preferred_lang: str = Field(default="en")
    theme: str = Field(default="light")
    avatar_url: Optional[str] = None
    
    reports: List[Report] = Relationship(back_populates="user")
    bugs: List[Bug] = Relationship(back_populates="user")
    migrations: List[DataMigration] = Relationship(back_populates="user")

class AIProvider(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True) # OpenAI, Anthropic, Ollama, Custom
    base_url: str
    api_key: Optional[str] = None # Will be encrypted
    is_active: bool = Field(default=False)
    is_cloud: bool = Field(default=False)
    default_model: str

class AIRouting(SQLModel, table=True):
    task_type: str = Field(primary_key=True) # requirements, scripts, copilot, etc.
    provider_id: int = Field(foreign_key="aiprovider.id")

class AIQueryLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    task_type: str
    provider_name: str
    model_name: str
    prompt_length: int
    response_length: int
    duration_ms: int
    status_code: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    is_cached: bool = Field(default=False)

class AICache(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    prompt_hash: str = Field(index=True, unique=True)
    response: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    task_type: Optional[str] = None
    model_name: Optional[str] = None

class SystemConfig(SQLModel, table=True):
    key: str = Field(primary_key=True) # e.g., "GLOBAL_ANNOUNCEMENT"
    value: str
    description: Optional[str] = None

class BackgroundJob(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str # migration, audit, etc.
    status: str = Field(default="pending") # pending, processing, completed, failed
    progress: int = Field(default=0)
    result: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
