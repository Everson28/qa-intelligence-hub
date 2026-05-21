import sqlite3
import os

db_paths = ['qa_hub.db', 'backend/qa_hub.db']
for db_path in db_paths:
    if not os.path.exists(db_path):
        continue
    
    print(f"Migrating database: {db_path}")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    def add_column(col_name, col_type, default=None):
        try:
            query = f"ALTER TABLE user ADD COLUMN {col_name} {col_type}"
            if default:
                query += f" DEFAULT '{default}'"
            c.execute(query)
            print(f"Added column {col_name} to user in {db_path}")
        except sqlite3.OperationalError as e:
            print(f"Column {col_name} might already exist in {db_path}: {e}")

    add_column('preferred_lang', 'TEXT', 'en')
    add_column('theme', 'TEXT', 'light')
    add_column('avatar_url', 'TEXT')

    # Bug Table Updates
    try:
        c.execute("ALTER TABLE bug ADD COLUMN actual TEXT")
    except sqlite3.OperationalError: pass
    
    try:
        c.execute("ALTER TABLE bug ADD COLUMN priority TEXT DEFAULT 'Medium'")
        print(f"Added column priority to bug in {db_path}")
    except sqlite3.OperationalError: pass

    # AIQueryLog Updates
    try:
        c.execute("ALTER TABLE aiquerylog ADD COLUMN is_cached BOOLEAN DEFAULT 0")
        print(f"Added column is_cached to aiquerylog in {db_path}")
    except sqlite3.OperationalError: pass

    # Multi-Project Updates
    def add_project_column(table_name):
        try:
            c.execute(f"ALTER TABLE {table_name} ADD COLUMN project TEXT DEFAULT 'General'")
            print(f"Added column project to {table_name} in {db_path}")
        except sqlite3.OperationalError as e:
            print(f"Column project in {table_name} might already exist in {db_path}: {e}")

    add_project_column('report')
    add_project_column('bug')
    add_project_column('datamigration')

    conn.commit()
    conn.close()
print("Migration completed.")
