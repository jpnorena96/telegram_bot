import mysql.connector
import logging
from config import DB_CONFIG

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Check if 'plan' column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'plan'")
        result = cursor.fetchone()
        
        if not result:
            logger.info("Adding 'plan' column to 'users' table...")
            cursor.execute("ALTER TABLE users ADD COLUMN plan VARCHAR(20) DEFAULT 'platino'")
            conn.commit()
            logger.info("Column 'plan' added successfully.")
        else:
            logger.info("Column 'plan' already exists.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        logger.error(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
