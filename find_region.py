import psycopg2
import os

password = "Yeda21E1611"
project_id = "hvuqetsdcwwewkkagtvh"

regions = [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "ca-central-1", "eu-central-1", "eu-central-2",
    "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1",
    "ap-northeast-1", "ap-northeast-2", "ap-northeast-3",
    "ap-south-1", "ap-southeast-1", "ap-southeast-2",
    "sa-east-1"
]

print(f"Brute-forcing Supabase regions for project {project_id}...")

for region in regions:
    for prefix in ["aws-0", "aws-1"]:
        host = f"{prefix}-{region}.pooler.supabase.com"
        port = 5432 # Session mode is more stable for testing
        user = f"postgres.{project_id}"
        
        try:
            # print(f"Testing {host}...", end=" ", flush=True)
            conn = psycopg2.connect(
                dbname="postgres",
                user=user,
                password=password,
                host=host,
                port=port,
                connect_timeout=3
            )
            print(f"\nSUCCESS IN REGION: {region} ({prefix})")
            print(f"WORKING HOST: {host}")
            print(f"CONNECTION STRING: postgresql://{user}:{password}@{host}:5432/postgres")
            conn.close()
            exit(0)
        except psycopg2.OperationalError as e:
            err_msg = str(e).strip()
            if "Tenant or user not found" in err_msg or "tenant/user" in err_msg:
                # This means we hit a pooler but it's the wrong region
                # print("Wrong region.")
                pass
            elif "name resolution" in err_msg:
                # DNS failure, skip
                pass
            else:
                print(f"{host}: {err_msg}")
        except Exception as e:
            print(f"{host}: Unexpected error: {type(e).__name__}: {e}")

print("\nFinished. No working region found. Please double check the project ID and password.")
