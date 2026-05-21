import streamlit as st
import requests
import pandas as pd
from bs4 import BeautifulSoup
from typing import Dict, Any, List, Optional
import json
import os
from dotenv import load_dotenv

load_dotenv()

# --- Configuración de la Página ---
st.set_page_config(
    page_title="QA Intelligence Hub",
    page_icon="🤖",
    layout="wide"
)

# --- Clase Engine para Ollama ---
class QAEngine:
    def __init__(self, model: str = None, base_url: str = None):
        self.model = model or os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")
        self.base_url = f"{base_url or os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')}/api/generate"

    def query(self, prompt: str) -> str:
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }
            response = requests.post(self.base_url, json=payload, timeout=60)
            response.raise_for_status()
            return response.json().get("response", "Error: No se recibió respuesta.")
        except requests.exceptions.RequestException as e:
            return f"Error de conexión con Ollama: {str(e)}. Asegúrate de que Ollama esté corriendo en el puerto 11434."

# --- Funciones de Utilidad ---
def scrape_url(url: str) -> Dict[str, Any]:
    try:
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        data = {
            "title": soup.title.string if soup.title else "N/A",
            "h1": [h.get_text() for h in soup.find_all('h1')],
            "images_without_alt": len([img for img in soup.find_all('img') if not img.get('alt')]),
            "links_count": len(soup.find_all('a')),
            "meta_description": soup.find('meta', attrs={'name': 'description'})['content'] if soup.find('meta', attrs={'name': 'description'}) else "N/A"
        }
        return data
    except Exception as e:
        return {"error": str(e)}

# --- Interfaz Principal ---
def main():
    st.sidebar.title("🛠️ QA Intelligence Hub")
    menu = st.sidebar.radio(
        "Navegación",
        ["Análisis de Requerimientos", "Generador de Scripts", "Auditor de Accesibilidad/SEO", "Reporte de Bugs"]
    )
    
    engine = QAEngine()

    if menu == "Análisis de Requerimientos":
        st.header("📋 Análisis de Requerimientos")
        user_story = st.text_area("Pega la Historia de Usuario aquí:", height=200, placeholder="Ej: Como usuario, quiero poder recuperar mi contraseña...")
        
        if st.button("Generar Casos de Prueba"):
            if user_story:
                with st.spinner("Analizando requerimientos..."):
                    prompt = f"""
                    Actúa como un experto QA Senior. Analiza la siguiente Historia de Usuario y genera:
                    1. Una tabla de Casos de Prueba con las columnas: ID, Descripción, Pasos, Resultado Esperado.
                    2. Los escenarios en formato Gherkin (Cucumber).
                    
                    Historia de Usuario:
                    {user_story}
                    
                    Responde ÚNICAMENTE con la tabla en formato Markdown y luego el código Gherkin.
                    """
                    result = engine.query(prompt)
                    
                    tab1, tab2 = st.tabs(["📊 Casos de Prueba", "🥒 Gherkin"])
                    
                    with tab1:
                        st.markdown(result)
                        st.download_button("Exportar Análisis (.md)", result, file_name="analisis_requerimientos.md")
                    
                    with tab2:
                        # Intento simple de extraer solo la parte Gherkin si la IA añadió texto extra
                        st.code(result, language="gherkin")
            else:
                st.error("Por favor, ingresa una historia de usuario.")

    elif menu == "Generador de Scripts":
        st.header("💻 Generador de Scripts de Automatización")
        task_desc = st.text_area("Describe la tarea de automatización:", placeholder="Ej: Loguearse en la web, buscar un producto 'laptop' y añadirlo al carrito.")
        
        if st.button("Generar Código Playwright"):
            if task_desc:
                with st.spinner("Generando script..."):
                    prompt = f"""
                    Genera un script de automatización funcional en Python usando la librería Playwright.
                    Tarea: {task_desc}
                    Incluye comentarios explicativos, usa tipado de datos y sigue las mejores prácticas.
                    Responde solo con el bloque de código.
                    """
                    code = engine.query(prompt)
                    st.code(code, language="python")
                    st.download_button("Descargar Script (.py)", code, file_name="automation_script.py")
            else:
                st.error("Describe una tarea para generar el código.")

    elif menu == "Auditor de Accesibilidad/SEO":
        st.header("🔍 Auditor de Accesibilidad y SEO")
        url = st.text_input("Ingresa la URL del sitio a auditar:", placeholder="https://example.com")
        
        if st.button("Ejecutar Auditoría"):
            if url:
                with st.spinner("Escaneando sitio y analizando con IA..."):
                    site_data = scrape_url(url)
                    if "error" in site_data:
                        st.error(f"Error al acceder a la URL: {site_data['error']}")
                    else:
                        prompt = f"""
                        Analiza los siguientes datos técnicos de un sitio web y califica del 1 al 10 su calidad en SEO y Accesibilidad.
                        Justifica brevemente la nota y da 3 recomendaciones de mejora.
                        
                        Datos extraídos:
                        - Título: {site_data['title']}
                        - Meta Descripción: {site_data['meta_description']}
                        - H1 encontrados: {site_data['h1']}
                        - Imágenes sin etiqueta ALT: {site_data['images_without_alt']}
                        - Cantidad de enlaces: {site_data['links_count']}
                        """
                        audit_report = engine.query(prompt)
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            st.subheader("Datos Técnicos")
                            st.json(site_data)
                        with col2:
                            st.subheader("Evaluación de IA")
                            st.write(audit_report)
                        
                        st.download_button("Descargar Reporte de Auditoría (.txt)", audit_report, file_name="auditoria_seo.txt")
            else:
                st.error("Ingresa una URL válida.")

    elif menu == "Reporte de Bugs":
        st.header("🐛 Reporte de Bugs Profesional")
        
        with st.form("bug_form"):
            col1, col2 = st.columns(2)
            with col1:
                title = st.text_input("Título del Bug", placeholder="Error al procesar pago con tarjeta")
                severity = st.selectbox("Severidad", ["Crítica", "Alta", "Media", "Baja"])
            with col2:
                environment = st.text_input("Entorno", placeholder="Producción / Staging / Chrome 124")
            
            steps = st.text_area("Pasos para reproducir")
            expected = st.text_input("Resultado Esperado")
            actual = st.text_input("Resultado Actual")
            
            submit = st.form_submit_button("Generar Reporte Markdown")
            
            if submit:
                bug_md = f"# [BUG] {title}\n\n" \
                         f"**Severidad:** {severity}\n" \
                         f"**Entorno:** {environment}\n\n" \
                         f"## Descripción\n{actual}\n\n" \
                         f"## Pasos para Reproducir\n{steps}\n\n" \
                         f"## Resultados\n" \
                         f"- **Esperado:** {expected}\n" \
                         f"- **Actual:** {actual}\n\n" \
                         f"---\n" \
                         f"*Reporte generado por QA Intelligence Hub*"
                st.subheader("Vista Previa")
                st.markdown(bug_md)
                st.download_button("Descargar Reporte (.md)", bug_md, file_name="bug_report.md")

if __name__ == "__main__":
    main()
