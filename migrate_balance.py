import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
import mysql.connector
from config import DB_CONFIG

def migrate():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    try:
        # Add columns for modules to users table
        cursor.execute("SHOW COLUMNS FROM users LIKE 'module_visa_enabled'")
        if not cursor.fetchone():
            print("Adding module_visa_enabled to users...")
            cursor.execute("ALTER TABLE users ADD COLUMN module_visa_enabled BOOLEAN DEFAULT TRUE")
            
        cursor.execute("SHOW COLUMNS FROM users LIKE 'module_appointments_enabled'")
        if not cursor.fetchone():
            print("Adding module_appointments_enabled to users...")
            cursor.execute("ALTER TABLE users ADD COLUMN module_appointments_enabled BOOLEAN DEFAULT TRUE")
            
        # Create balance_history table
        print("Creating balance_history table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS balance_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                amount INT NOT NULL,
                type ENUM('topup', 'spend') NOT NULL,
                description VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        conn.commit()
        print("Migration successful.")
    except Exception as e:
        conn.rollback()
        print(f"Error during migration: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    migrate()
