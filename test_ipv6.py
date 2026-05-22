import psycopg2
import os

password = "Yeda21E1611"
ipv6_address = "2600:1f18:4f06:de01:4775:3d2f:b348:19f3"

print(f"Testing direct IPv6 connection to {ipv6_address}...")

try:
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password=password,
        host=ipv6_address,
        port=5432,
        connect_timeout=10
    )
    print("SUCCESS!")
    conn.close()
    print(f"\nWORKING CONNECTION: postgresql://postgres:{password}@[{ipv6_address}]:5432/postgres")
except Exception as e:
    print(f"FAILED: {str(e).strip()}")
