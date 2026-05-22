FROM python:3.10-slim

# Evitar que Python genere archivos .pyc y habilitar logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instalar dependencias del sistema necesarias para psycopg2 y otras herramientas
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar requerimientos desde la carpeta backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
# La estructura en el contenedor será /app/app/...
COPY backend/app /app/app
# Copiar otros directorios necesarios si existen
COPY backend/static /app/static

# Exponer el puerto que usa Render (por defecto 10000 o el que definas)
EXPOSE 10000

# Comando para iniciar la aplicación
# Usamos app.main:app porque 'app' es el paquete que contiene main.py
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
