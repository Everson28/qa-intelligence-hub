from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class RequirementRequest(BaseModel):
    user_story: str = Field(..., description="La User Story o descripción del requisito a analizar.")
    project: Optional[str] = Field("General", description="Nombre del proyecto asociado.")

class ScriptRequest(BaseModel):
    description: str = Field(..., description="Descripción de la funcionalidad para la que se generará el script.")
    project: Optional[str] = Field("General", description="Nombre del proyecto asociado.")

class AuditRequest(BaseModel):
    url: Optional[str] = Field(None, description="URL del sitio web a auditar.")
    file_path: Optional[str] = Field(None, description="Ruta local a un archivo HTML para auditar.")
    code_content: Optional[str] = Field(None, description="Contenido del código fuente para auditoría de caja blanca.")
    project: Optional[str] = Field("General", description="Nombre del proyecto asociado.")

class QualityStrategyRequest(BaseModel):
    project_description: str = Field(..., description="Descripción detallada del proyecto.")
    tech_stack: Optional[str] = Field(None, description="Stack tecnológico sugerido o actual.")
    focus_areas: Optional[List[str]] = Field(None, description="Áreas específicas de enfoque (ej: performance, security).")
    project: Optional[str] = Field("General", description="Nombre del proyecto asociado.")

class SecurityAuditRequest(BaseModel):
    code_content: str = Field(..., description="Contenido del código fuente a analizar.")
    language: str = Field(..., description="Lenguaje de programación del código (ej: python, javascript).")
    project: Optional[str] = Field("General", description="Nombre del proyecto asociado.")

class DataGenRequest(BaseModel):
    structure: str = Field(..., description="Estructura o esquema de los datos a generar.")
    format: str = Field(..., description="Formato de salida (csv, json, sql).")
    count: int = Field(default=10, description="Cantidad de registros a generar.")
    project: Optional[str] = Field("General", description="Nombre del proyecto asociado.")

class ApiTestRequest(BaseModel):
    endpoint_info: str = Field(..., description="Información del endpoint (método, URL, parámetros).")
    response_sample: Optional[str] = Field(None, description="Ejemplo de respuesta JSON esperada.")
    project: Optional[str] = Field("General", description="Nombre del proyecto asociado.")

class FunctionalTestRequest(BaseModel):
    url: str = Field(..., description="URL del sitio web para simular pruebas funcionales.")
    project: Optional[str] = Field("General", description="Nombre del proyecto asociado.")

class BugReportRequest(BaseModel):
    title: str = Field(..., description="Título del bug.")
    severity: str = Field(..., description="Severidad (Low, Medium, High, Critical).")
    priority: str = Field(default="Medium", description="Prioridad (Low, Medium, High, Urgente).")
    environment: str = Field(..., description="Entorno donde se encontró el bug.")
    project: Optional[str] = Field("General", description="Nombre del proyecto asociado.")
    steps: str = Field(..., description="Pasos para reproducir el bug.")
    expected: str = Field(..., description="Resultado esperado.")
    actual: str = Field(..., description="Resultado real.")

class GenericResponse(BaseModel):
    status: str
    data: Any

# Schemas para Autenticación e Identidad
class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "user"
    preferred_lang: Optional[str] = "en"

class UserUpdate(BaseModel):
    preferred_lang: Optional[str] = None
    theme: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    preferred_lang: str
    theme: str
    avatar_url: Optional[str] = None

# Schemas para Orquestación de IA
class AIProviderCreate(BaseModel):
    name: str
    base_url: str
    api_key: Optional[str] = None
    is_cloud: bool = False
    default_model: str

class AIProviderResponse(BaseModel):
    id: int
    name: str
    base_url: str
    is_active: bool
    is_cloud: bool
    default_model: str

class AIRoutingUpdate(BaseModel):
    task_type: str
    provider_id: int

class SystemConfigSchema(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
