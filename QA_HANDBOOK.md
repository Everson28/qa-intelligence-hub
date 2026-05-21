# QA Engineering & AI Automation Handbook

Este documento describe los procesos y herramientas de calidad utilizados en el **QA Intelligence Hub**, alineados con las prácticas modernas de desarrollo asistido por IA.

## 1. Validación de UX/UI Asistida por IA
En nuestro flujo de trabajo, los agentes de IA generan cambios rápidos en la interfaz. Como Ingenieros de QA, nuestra responsabilidad es:
- **Auditoría Visual:** Utilizar el módulo de `Audit URL` para obtener un análisis preliminar de accesibilidad (OWASP) y estructura HTML.
- **Validación Humana:** Verificar que la coherencia visual y usabilidad (que la IA no puede evaluar al 100%) se mantengan tras cada iteración.

## 2. Gestión de Defectos (Bugs)
Los errores encontrados deben documentarse en el módulo de **Bugs** con la siguiente estructura:
- **Título:** Claro y conciso.
- **Severidad:** Low, Medium, High, Critical.
- **Pasos para reproducir:** Lista numerada.
- **Resultados:** Comparativa clara entre *Esperado* vs *Actual*.

El ciclo de vida de un bug en este Hub es: `Open` -> `In Progress` -> `Fixed` -> `Verified` -> `Closed`.

## 3. Automatización con Playwright
Utilizamos Playwright con Python por su robustez. 
- **Generación:** El módulo `Generate Script` utiliza prompts optimizados para crear scripts con selectores resilientes (preferencia por `data-test`).
- **Ejecución:** Los scripts se ejecutan en un entorno aislado y los resultados se guardan en el historial para auditoría.

## 4. Modernización de Reportes (Data Engineering)
Para la migración de sistemas heredados (Access/Excel) a la nube:
1. **Ingesta:** Carga de archivos Excel/CSV legacy.
2. **Transformación:** Limpieza y validación de datos mediante Pandas (simulando lógica de Snowflake).
3. **Distribución:** Generación automatizada de reportes PDF profesionales para las partes interesadas.

## 5. CI/CD y Calidad Continua (El "Quality Gate")
Cada cambio en el código debe ser validado automáticamente antes de fusionarse (Merge):
- **GitHub Actions:** El workflow de CI (`main.yml`) actúa como nuestro "portero" de calidad. Se activa en cada **Pull Request**.
- **Linting:** Verifica que el código siga estándares profesionales (PEP8) automáticamente.
- **Artefactos de Prueba:** Tras cada ejecución en la nube, el sistema genera un **QA Test Report (HTML)** que se adjunta al Pull Request. Esto permite a los stakeholders ver el estado de la calidad sin tocar el código.

## 6. Validación de Migración de Datos (Legacy → Snowflake)
Para asegurar que no se pierdan datos durante la transición a la nube:
1. **Detección de Esquema:** Mapeo automático de tipos de datos antiguos a Snowflake SQL.
2. **Data Integrity Suite:** Generamos scripts de **Pytest** que comparan el origen (Excel) contra el destino (Snowflake) buscando discrepancias en conteos de filas y valores críticos.
3. **Analítica en Reportes:** Los informes finales incluyen gráficos de distribución y sellos de integridad para auditoría técnica.
