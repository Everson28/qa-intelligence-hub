FROM python:3.12-slim

# Evitar que Python genere archivos .pyc y habilitar logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Al estar el "Root Directory" en 'backend', los archivos se copian relativo a esa carpeta
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend (la carpeta 'app' está dentro de 'backend')
COPY app /app/app

# Crear carpetas necesarias y copiar estáticos si existen
RUN mkdir -p /app/static /app/reports
COPY . /app/tmp_build
RUN if [ -d "/app/tmp_build/static" ]; then cp -r /app/tmp_build/static/. /app/static/; fi && rm -rf /app/tmp_build

# Exponer el puerto
EXPOSE 10000

# Comando para iniciar la aplicación
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
CMD ["sleep", "3600"]