# 🛡️ QA Intelligence Hub Pro
### *The Enterprise-Grade QA AI Orchestrator*

**QA Intelligence Hub Pro** es una plataforma avanzada de orquestación de inteligencia artificial diseñada específicamente para ecosistemas de Aseguramiento de Calidad (QA). Permite a los equipos de ingeniería elevar los estándares de calidad mediante el uso inteligente de modelos de lenguaje (LLMs), combinando la potencia de la nube con la privacidad del cómputo local.

---

## 🌟 Propuesta de Valor

En un entorno donde la velocidad del software supera la capacidad humana de prueba, el **QA Intelligence Hub Pro** actúa como un multiplicador de fuerza. Automatiza las tareas más tediosas del QA —desde el análisis de historias de usuario hasta la validación de integridad de datos— permitiendo que los ingenieros se enfoquen en la estrategia y la arquitectura.

---

## 🚀 Características Principales

### 🤖 Core de IA Híbrido (Proprietary Router)
El corazón de la plataforma es un router inteligente capaz de alternar entre:
- **Local Power:** Integración nativa con **Ollama** para usar modelos como `Qwen2.5-Coder` o `Llama3` sin costo y con total privacidad.
- **Cloud Scale:** Conexión con **Groq, Google Gemini, OpenAI y Anthropic** para tareas de alta complejidad o cuando el hardware local no está disponible.
- **Smart Fallback:** Si tu servidor local se apaga, el Hub salta automáticamente a la nube para garantizar continuidad.

### 📊 Gestión de Defectos y Analíticas
- **Bug Tracker Pro:** Registro centralizado de incidentes con niveles de severidad y prioridad.
- **Analytics Dashboard:** Visualización en tiempo real del rendimiento de la IA, tiempos de respuesta y longitud de prompts.
- **Exportación Inteligente:** Generación de reportes en CSV para integración con herramientas externas.

### ❄️ Modernización de Datos (Legacy to Snowflake)
Módulo especializado para la transición digital:
- **Data Migration Assistant:** Transforma archivos antiguos (Access, Excel, CSV) en estructuras optimizadas para Snowflake.
- **Auto-Pytest Generation:** La IA analiza tus datos y escribe automáticamente una suite de pruebas en Python (Pytest) para validar que la migración fue exitosa.

### 🌐 Auditorías de Calidad 360°
- **Caja Blanca:** Análisis profundo de código fuente para encontrar vulnerabilidades y bugs lógicos.
- **Accesibilidad:** Auditoría automática bajo estándares WCAG.
- **SEO & Performance:** Análisis de URLs para optimización en motores de búsqueda.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Lucide Icons, Vite |
| **Backend** | FastAPI (Python 3.10+), SQLModel (ORM) |
| **Base de Datos** | PostgreSQL (Supabase) / SQLite (Local) |
| **Orquestación IA** | QAIntelligenceRouter (Custom Python Implementation) |
| **Infraestructura** | Docker, Docker Compose |

---

## 🚀 Despliegue Zero Cost (100% Gratis)

Esta arquitectura está optimizada para ejecutarse en capas gratuitas:

1.  **DB (Supabase):** Crea un proyecto y obtén tu URI de Postgres.
2.  **Backend (Render):** Sube el código y configura `DATABASE_URL` (Usa el puerto 6543 con el formato `postgres.ID:password`).
3.  **Frontend (Vercel):** Conecta tu repositorio y apunta `VITE_API_URL` a tu instancia de Render.
4.  **IA:** Agrega tus API Keys de Groq o Gemini en el panel de administración para tener IA potente sin costo mensual.

---

## 💻 Instalación para Desarrolladores

### Requisitos Previos
- Python 3.10+
- Node.js 18+
- Ollama (opcional, para modo local)

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Seguridad y Privacidad
El proyecto implementa encriptación AES para las API Keys de los proveedores de IA almacenadas en la base de datos, asegurando que tus credenciales nunca estén expuestas en texto plano.
