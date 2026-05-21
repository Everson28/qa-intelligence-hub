import sqlite3
import random
from datetime import datetime, timedelta

def seed():
    conn = sqlite3.connect('qa_hub.db')
    c = conn.cursor()
    
    user_id = 2 # dearmas28
    
    print(f"Seeding data for user {user_id}...")

    # 1. Clear existing demo data (Optional, but cleaner for demo)
    c.execute("DELETE FROM bug WHERE user_id = ?", (user_id,))
    c.execute("DELETE FROM report WHERE user_id = ?", (user_id,))
    c.execute("DELETE FROM datamigration WHERE user_id = ?", (user_id,))
    
    # 2. Seed Professional Bugs
    bugs = [
        ("Auth Token Leak in LocalStorage", "Critical", "Urgente", "Prod", "Open"),
        ("Race Condition in SQLModel Session", "High", "High", "Staging", "In Progress"),
        ("UI Glitch: Overlapping Charts in Mobile", "Low", "Medium", "QA", "Open"),
        ("API Timeout on Large CSV Upload", "Medium", "High", "QA", "Open"),
        ("Broken Link in Footer Documentation", "Low", "Low", "Prod", "Closed"),
        ("Memory Leak during PDF Generation", "High", "Urgente", "Staging", "Open")
    ]
    
    for title, sev, prio, env, status in bugs:
        c.execute("""
            INSERT INTO bug (title, severity, priority, status, environment, steps, expected, actual, created_at, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            title, sev, prio, status, env, 
            "1. Login\n2. Perform action X\n3. Observe Y", 
            "System should handle data correctly", 
            "Unexpected crash or leak observed",
            (datetime.utcnow() - timedelta(days=random.randint(1, 10))).isoformat(),
            user_id
        ))

    # 3. Seed Professional Reports
    reports = [
        ("Audit: E-commerce Checkout Flow", "audit", "Found 3 SEO bottlenecks and 2 security warnings."),
        ("Script: Automated Login Playwright", "script", "import asyncio\nfrom playwright.async_api import async_playwright..."),
        ("Strategy: Cloud Modernization 2026", "strategy", "Focusing on Snowflake migration and AI-driven quality gates."),
        ("Requirement: Multi-factor Authentication", "requirements", "AC1: User must receive SMS code. AC2: Code expires in 5 mins.")
    ]
    
    for title, rtype, content in reports:
        c.execute("""
            INSERT INTO report (title, type, content, created_at, user_id)
            VALUES (?, ?, ?, ?, ?)
        """, (
            title, rtype, content,
            (datetime.utcnow() - timedelta(hours=random.randint(1, 48))).isoformat(),
            user_id
        ))

    # 4. Seed AI Query Logs (for the graphs)
    for i in range(20):
        c.execute("""
            INSERT INTO aiquerylog (task_type, provider_name, model_name, prompt_length, response_length, duration_ms, status_code, is_cached, created_at, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            random.choice(['requirements', 'scripts', 'oracle', 'copilot']),
            random.choice(['Ollama', 'OpenAI']),
            'qwen2.5-coder',
            random.randint(500, 2000),
            random.randint(1000, 4000),
            random.randint(800, 5000),
            200,
            random.choice([0, 1]),
            (datetime.utcnow() - timedelta(minutes=i*30)).isoformat(),
            user_id
        ))

    conn.commit()
    conn.close()
    print("Demo data seeded successfully! 1000% operational.")

if __name__ == "__main__":
    seed()
