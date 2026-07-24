import os
import mysql.connector
from dotenv import load_dotenv

def run_migration():
    load_dotenv("../.env")
    host = os.getenv("DB_HOST", "localhost")
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASS", "")
    database = os.getenv("DB_NAME", "telegram_bot")

    conn = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )
    cursor = conn.cursor()

    # 1. Modify client_email to allow NULL
    print("Modifying client_email to allow NULL...")
    try:
        cursor.execute("ALTER TABLE visa_processes MODIFY client_email VARCHAR(255) NULL;")
        conn.commit()
    except Exception as e:
        print(f"Skipping client_email modify: {e}")

    # 2. Add target_country
    print("Adding target_country...")
    try:
        cursor.execute("ALTER TABLE visa_processes ADD COLUMN target_country VARCHAR(100) NOT NULL DEFAULT 'Estados Unidos';")
        conn.commit()
    except Exception as e:
        print(f"Skipping target_country add: {e}")

    # 3. Add visa_category
    print("Adding visa_category...")
    try:
        cursor.execute("ALTER TABLE visa_processes ADD COLUMN visa_category VARCHAR(100) NOT NULL DEFAULT 'B1/B2';")
        conn.commit()
    except Exception as e:
        print(f"Skipping visa_category add: {e}")

    # 4. Modify full_name in visa_applicants to allow NULL
    print("Modifying full_name to allow NULL in applicants...")
    try:
        cursor.execute("ALTER TABLE visa_applicants MODIFY full_name VARCHAR(255) NULL;")
        conn.commit()
    except Exception as e:
        print(f"Skipping full_name modify: {e}")


    cursor.close()
    conn.close()
    print("Migration completed successfully.")

if __name__ == "__main__":
    run_migration()
