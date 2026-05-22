import subprocess
import os
import tempfile
import asyncio
import sys

def _run_sync_script(script_path: str):
    """Ejecuta un script usando el ejecutable de python actual."""
    # Usar sys.executable para que funcione tanto localmente como en Docker
    python_exec = sys.executable
    process = subprocess.run(
        [python_exec, script_path],
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='replace' # Maneja caracteres extraños sin romper
    )
    return process

async def run_script(script_code: str) -> str:
    """Ejecuta un script de Playwright de forma segura usando un executor."""
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as tmp_file:
        tmp_file.write(script_code)
        tmp_path = tmp_file.name

    try:
        # Usar run_in_executor para ejecutar en un hilo separado
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, _run_sync_script, tmp_path)
        
        if result.returncode != 0:
            return f"Error en la ejecución:\n{result.stderr}\n{result.stdout}"
        
        return result.stdout if result.stdout else "Ejecución finalizada con éxito (sin salida stdout)."

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
