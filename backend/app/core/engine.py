import httpx
from typing import Dict, Any, List, Optional
import asyncio
import os
import json
import hashlib
import traceback
from datetime import datetime
from dotenv import load_dotenv
from sqlmodel import Session, select
from app.db.database import engine as db_engine
from app.db.models import AIProvider, AIRouting, SystemConfig, AIQueryLog, AICache

load_dotenv()

class QAIntelligenceRouter:
    def __init__(self):
        # Timeout extendido para Ollama y estabilidad en APIs Cloud
        self.client = httpx.AsyncClient(timeout=httpx.Timeout(10.0, read=120.0))

    def _get_prompt_hash(self, prompt: str, system: str, model: str) -> str:
        content = f"{system}|{model}|{prompt}"
        return hashlib.sha256(content.encode()).hexdigest()

    async def _query_ollama(self, provider: AIProvider, prompt: str, system: str, model: str) -> str:
        """Consulta a Ollama (Local/Self-hosted)"""
        url = f"{provider.base_url}/api/generate"
        payload = {
            "model": model or provider.default_model,
            "prompt": prompt,
            "system": system,
            "stream": False,
            "options": {"temperature": 0.7}
        }
        res = await self.client.post(url, json=payload)
        res.raise_for_status()
        return res.json().get("response", "")

    async def _query_openai_style(self, provider: AIProvider, prompt: str, system: str, model: str) -> str:
        """Consulta compatible con OpenAI (incluye Groq)"""
        url = f"{provider.base_url}/v1/chat/completions" if "/v1" not in provider.base_url else f"{provider.base_url}/chat/completions"
        headers = {"Authorization": f"Bearer {provider.api_key}"}
        payload = {
            "model": model or provider.default_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }
        res = await self.client.post(url, json=payload, headers=headers)
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

    async def _query_gemini(self, provider: AIProvider, prompt: str, system: str, model: str) -> str:
        """Consulta nativa para Google Gemini"""
        model_name = model or provider.default_model
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={provider.api_key}"
        payload = {
            "contents": [{
                "parts": [{"text": f"SYSTEM: {system}\n\nUSER: {prompt}"}]
            }]
        }
        res = await self.client.post(url, json=payload)
        res.raise_for_status()
        return res.json()["candidates"][0]["content"]["parts"][0]["text"]

    async def query(self, prompt: str, system: str = "Eres un experto en QA.", task_type: str = "general", model_override: Optional[str] = None) -> str:
        with Session(db_engine) as session:
            # 0. Cache check
            p_hash = self._get_prompt_hash(prompt, system, model_override or "default")
            cached = session.exec(select(AICache).where(AICache.prompt_hash == p_hash)).first()
            if cached:
                self._log_query(task_type, None, model_override or "cached", prompt, cached.response, 0, 200, is_cached=True)
                return cached.response

            # 1. Resolver Proveedor
            # Prioridad 1: Routing específico por tarea
            routing = session.get(AIRouting, task_type)
            provider = None
            if routing:
                provider = session.get(AIProvider, routing.provider_id)
            
            # Prioridad 2: Proveedor marcado como activo
            if not provider:
                provider = session.exec(select(AIProvider).where(AIProvider.is_active == True)).first()

            # Prioridad 3: Emergencia (Ollama local por defecto si nada está configurado)
            if not provider:
                provider = AIProvider(
                    name="Ollama (Local)",
                    base_url="http://localhost:11434",
                    default_model="qwen2.5-coder:7b",
                    is_cloud=False
                )

            try:
                start_time = datetime.utcnow()
                response = ""

                # 2. Ejecutar según tipo de proveedor
                if not provider.is_cloud:
                    # Intento local (Ollama)
                    try:
                        response = await self._query_ollama(provider, prompt, system, model_override)
                    except Exception as e:
                        # Si falla lo local, buscar el primer proveedor Cloud activo como fallback
                        cloud_fallback = session.exec(select(AIProvider).where(AIProvider.is_cloud == True, AIProvider.is_active == True)).first()
                        if cloud_fallback:
                            print(f"Ollama offline, saltando a Cloud ({cloud_fallback.name})...")
                            provider = cloud_fallback
                        else:
                            raise e

                if provider.is_cloud:
                    if "google" in provider.base_url.lower() or "gemini" in provider.name.lower():
                        response = await self._query_gemini(provider, prompt, system, model_override)
                    else:
                        # OpenAI, Groq, Anthropic (via proxy), etc.
                        response = await self._query_openai_style(provider, prompt, system, model_override)
                
                duration = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                
                # 3. Guardar en Cache si la respuesta es válida
                if response:
                    new_cache = AICache(
                        prompt_hash=p_hash, 
                        response=response, 
                        task_type=task_type, 
                        model_name=model_override or provider.default_model
                    )
                    session.add(new_cache)
                    session.commit()

                self._log_query(task_type, provider, model_override or provider.default_model, prompt, response, duration, 200)
                return response
            
            except Exception as e:
                error_details = f"{type(e).__name__}: {str(e)}"
                print(f"CRITICAL AI ERROR: {error_details}")
                self._log_query(task_type, provider, model_override or (provider.default_model if provider else "unknown"), prompt, "", 0, 500)
                return f"Error en la conexión con la IA. Asegúrate de que tu modelo local esté corriendo o que tu API Key sea válida. Detalle: {error_details}"

    def _log_query(self, task_type: str, provider: Optional[AIProvider], model: str, prompt: str, response: str, duration: int, status_code: int, is_cached: bool = False):
        try:
            with Session(db_engine) as session:
                log = AIQueryLog(
                    task_type=task_type,
                    provider_name=provider.name if provider else "Cache",
                    model_name=model,
                    prompt_length=len(prompt),
                    response_length=len(response),
                    duration_ms=duration,
                    status_code=status_code,
                    is_cached=is_cached
                )
                session.add(log)
                session.commit()
        except Exception as e:
            print(f"FAILED TO LOG AI QUERY: {e}")

# Exportar instancia global
engine = QAIntelligenceRouter()
