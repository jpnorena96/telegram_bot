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
                
        # Create visa_processes table
        print("Creating 'visa_processes' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS visa_processes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                client_email VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'En Progreso',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        conn.commit()

        # Create visa_applicants table
        print("Creating 'visa_applicants' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS visa_applicants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                process_id INT NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                relationship VARCHAR(100) NOT NULL DEFAULT 'primary',
                passport_number VARCHAR(100) NULL,
                ds160_confirmation VARCHAR(100) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (process_id) REFERENCES visa_processes(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        conn.commit()

        # Create visa_documents table
        print("Creating 'visa_documents' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS visa_documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                applicant_id INT NOT NULL,
                document_type VARCHAR(100) NOT NULL,
                file_path VARCHAR(512) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'uploaded',
                notes TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (applicant_id) REFERENCES visa_applicants(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        conn.commit()
                
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
