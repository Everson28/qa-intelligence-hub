import sys
import os

# Añadir el directorio backend al path para poder importar los módulos de la app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core.reporting import process_migration_file

def test_report_generation():
    file_path = 'sample_qa_data.csv'
    with open(file_path, 'rb') as f:
        content = f.read()
    
    print(f"Procesando {file_path}...")
    result = process_migration_file(content, file_path)
    
    print("\n¡Éxito!")
    print(f"Registros procesados: {result['records_count']}")
    print(f"Reporte generado en: {result['pdf_path']}")
    
if __name__ == "__main__":
    test_report_generation()
