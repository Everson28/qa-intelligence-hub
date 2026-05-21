# 🛡️ QA Intelligence Hub Pro

**QA Intelligence Hub Pro** es una plataforma de orquestación de IA diseñada para equipos de QA Enterprise. Permite automatizar la creación de estrategias de prueba, análisis de requerimientos, generación de datos y auditorías de calidad de forma híbrida (Local + Cloud).

## ✨ Características Principales

- **🤖 Router de IA Híbrido:** Conéctate a modelos locales con **Ollama** o usa APIs en la nube como **Groq, Gemini, OpenAI y Anthropic**.
- **📊 Gestión de Calidad:** Reporte de bugs, exportación CSV y analíticas de rendimiento de IA.
- **🚀 Modernización de Datos:** Migración de archivos Legacy (Access/Excel/CSV) hacia Snowflake con validación automática en Pytest.
- **🌐 Auditorías Automáticas:** Auditorías de SEO, Accesibilidad y Caja Blanca con IA.

---

## 🚀 Despliegue Híbrido y Gratuito (Zero Cost)

Este proyecto está diseñado para funcionar de forma 100% gratuita utilizando los siguientes servicios:

### 1. Base de Datos (Supabase)
1. Crea un proyecto gratuito en [Supabase](https://supabase.com/).
2. Ve a **Project Settings > Database** y copia la **Connection String** (URI).
3. Asegúrate de que use el protocolo `postgresql://`.

### 2. Backend (Render)
1. Sube tu código a GitHub.
2. Crea un nuevo **Web Service** en [Render](https://render.com/).
3. Configura las siguientes Variables de Entorno:
   - `DATABASE_URL`: Tu URI de Supabase.
   - `SECRET_KEY`: Una cadena aleatoria para JWT.
4. Render usará el `Dockerfile` de la carpeta `/backend`.

### 3. Frontend (Vercel)
1. Crea un nuevo proyecto en [Vercel](https://vercel.com/).
2. Configura la Variable de Entorno:
   - `VITE_API_URL`: La URL de tu backend en Render.

### 4. Configuración de IA Híbrida
En el **Panel de Administración** de la App:
- **Ollama Local:** URL `http://localhost:11434`, `is_cloud: false`. (Usa tu PC).
- **Cloud Gratis:** Usa [Groq](https://console.groq.com/) o [Gemini](https://aistudio.google.com/). Marca `is_cloud: true`.

---

## 🛠️ Instalación Local (Desarrollo)

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Ollama:**
   Asegúrate de tener [Ollama](https://ollama.com/) instalado y ejecutando `ollama serve`.
