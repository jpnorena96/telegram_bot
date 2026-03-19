import mysql.connector
import sys
import os

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_CONFIG

def migrate():
    print("Starting database migration...")
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Check if full_name column exists
        try:
            cursor.execute("SELECT full_name FROM users LIMIT 1")
            print("Column 'full_name' already exists.")
            cursor.fetchall()
        except mysql.connector.Error as err:
            if "Unknown column" in str(err):
                print("Adding 'full_name' column to 'users' table...")
                cursor.execute("ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NULL DEFAULT NULL")
                conn.commit()
            
        # Check if role column exists
        try:
            cursor.execute("SELECT role FROM users LIMIT 1")
            print("Column 'role' already exists.")
            cursor.fetchall()
        except mysql.connector.Error as err:
            if "Unknown column" in str(err):
                print("Adding 'role' column to 'users' table...")
                cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'NATURAL_PERSON'")
                conn.commit()
                
        # Optional: Add test users if needed
        # We'll skip this to not pollute the DB, user can register them through UI.
                
        print("Migration completed successfully!")
        
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL Database: {err}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

if __name__ == "__main__":
    migrate()
