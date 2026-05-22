import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

password = "Yeda21E1611"
project_id = "hvuqetsdcwwewkkagtvh"

hosts = [
    f"db.{project_id}.supabase.co",
    f"aws-0-us-east-1.pooler.supabase.com",
    f"aws-0-sa-east-1.pooler.supabase.com",
    f"aws-0-eu-central-1.pooler.supabase.com"
]

ports = [5432, 6543]

print(f"Testing connections for project {project_id}...")

for host in hosts:
    for port in ports:
        try:
            user = "postgres" if port == 5432 and "db." in host else f"postgres.{project_id}"
            print(f"Testing {host}:{port} with user {user}...", end=" ")
            conn = psycopg2.connect(
                dbname="postgres",
                user=user,
                password=password,
                host=host,
                port=port,
                connect_timeout=5
            )
            print("SUCCESS!")
            conn.close()
            print(f"\nFOUND WORKING CONNECTION: postgresql://{user}:{password}@{host}:{port}/postgres")
            exit(0)
        except Exception as e:
            print(f"FAILED: {str(e).strip()}")

print("\nNo working connection found. Please check your password and project region.")
