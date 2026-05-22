FROM python:3.12-slim

# Evitar que Python genere archivos .pyc y habilitar logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 10000

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Crear un usuario no-root para seguridad
RUN adduser --disabled-password --gecos "" appuser

WORKDIR /app

# Al estar el "Root Directory" en 'backend' en Render, 
# los archivos se copian relativo a esa carpeta
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
# La estructura resultante será /app/app/...
COPY app /app/app

# Crear carpetas necesarias y asegurar permisos
RUN mkdir -p /app/static/avatars /app/reports && \
    chown -R appuser:appuser /app

# Copiar archivos estáticos adicionales si existen en el contexto
COPY . /app/tmp_build
RUN if [ -d "/app/tmp_build/static" ]; then cp -r /app/tmp_build/static/. /app/static/ || true; fi && \
    rm -rf /app/tmp_build

# Cambiar al usuario no-root
USER appuser

# Exponer el puerto (Render usa la variable PORT)
EXPOSE 10000

# Comando para iniciar la aplicación usando Gunicorn con worker de Uvicorn para producción
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:10000", "--timeout", "120"]
