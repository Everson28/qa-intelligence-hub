from app.core.engine import engine

class QualityScanner:
    def __init__(self):
        self.engine = engine

    async def run_full_scan(self, code: str, url: str = None) -> dict:
        """
        Ejecuta un escaneo 360: Riesgos de Código, Cobertura y Accesibilidad.
        """
        results = {
            "risk_scan": await self._scan_risks(code),
            "coverage_scan": await self._scan_coverage(code),
            "accessibility_scan": await self._scan_accessibility(code, url)
        }
        return results

    async def _scan_risks(self, code: str) -> str:
        prompt = f"""
        Realiza un escaneo de seguridad y arquitectura sobre este código:
        {code[:2000]}
        Detecta:
        1. Vulnerabilidades de seguridad (ej: inyecciones, malas prácticas).
        2. Riesgos de arquitectura (ej: código espagueti, alta complejidad).
        3. Secretos expuestos (keys hardcodeadas).
        Devuelve el reporte en formato Markdown.
        """
        return await self.engine.query(prompt, system="Eres un Senior Security & Arch Architect.", task_type="white_box")

    async def _scan_coverage(self, code: str) -> str:
        prompt = f"""
        Analiza este código y determina la cobertura de testing ideal:
        {code[:2000]}
        Identifica:
        1. Módulos críticos que necesitan tests unitarios.
        2. Edge cases (casos borde) que faltan por cubrir.
        3. Propón una estrategia de tests para este bloque.
        """
        return await self.engine.query(prompt, system="Eres un QA Automation Lead.", task_type="scripts")

    async def _scan_accessibility(self, code: str, url: str) -> str:
        target = url if url else f"Código: {code[:500]}"
        prompt = f"""
        Realiza una auditoría de accesibilidad WCAG 2.1 sobre: {target}
        Detecta fallos de contraste, ARIA y estructura. Proporciona recomendaciones accionables.
        """
        return await self.engine.query(prompt, system="Eres un experto en Accesibilidad Web.", task_type="accessibility")
