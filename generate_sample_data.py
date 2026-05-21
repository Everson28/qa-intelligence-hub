import pandas as pd
import random
from datetime import datetime, timedelta

# Generar datos simulados de QA
data = []
categories = ['Frontend', 'Backend', 'Database', 'Mobile', 'Security']
severities = ['Low', 'Medium', 'High', 'Critical']

for i in range(1, 101):
    data.append({
        'Test_ID': f'TS-{1000 + i}',
        'Category': random.choice(categories),
        'Severity': random.choice(severities),
        'Response_Time_ms': random.randint(50, 2000),
        'Memory_Usage_MB': random.randint(100, 500),
        'Execution_Date': (datetime.now() - timedelta(days=random.randint(0, 30))).strftime('%Y-%m-%d')
    })

df = pd.DataFrame(data)
df.to_csv('sample_qa_data.csv', index=False)
print("Archivo 'sample_qa_data.csv' generado con éxito.")
