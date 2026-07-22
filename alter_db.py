import mysql.connector
import sys
import os

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))
from config import DB_CONFIG

def alter_db():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE user_appointments ADD COLUMN process_type VARCHAR(50) DEFAULT 'Individual'")
        conn.commit()
        print("Column process_type added successfully.")
    except Exception as e:
        print(f"Error (column might exist): {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    alter_db()
