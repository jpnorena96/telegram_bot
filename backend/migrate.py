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
        # Check if subscription_status column exists
        try:
            cursor.execute("SELECT subscription_status FROM users LIMIT 1")
            print("Column 'subscription_status' already exists.")
            cursor.fetchall()
        except mysql.connector.Error as err:
            if "Unknown column" in str(err):
                print("Adding subscription columns to 'users' table...")
                cursor.execute("ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'pending'")
                cursor.execute("ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(50) NULL DEFAULT NULL")
                cursor.execute("ALTER TABLE users ADD COLUMN wompi_transaction_id VARCHAR(100) NULL DEFAULT NULL")
                
                # Make existing administrators and system accounts active by default
                cursor.execute("UPDATE users SET subscription_status = 'active' WHERE role IN ('ADMINISTRATOR', 'AUDITOR', 'VISA_MANAGER')")
                conn.commit()

        # Check if logo_url column exists
        try:
            cursor.execute("SELECT logo_url FROM users LIMIT 1")
            print("Column 'logo_url' already exists.")
            cursor.fetchall()
        except mysql.connector.Error as err:
            if "Unknown column" in str(err):
                print("Adding 'logo_url' column to 'users' table...")
                cursor.execute("ALTER TABLE users ADD COLUMN logo_url VARCHAR(512) NULL DEFAULT NULL")
                conn.commit()

        # Check if balance column exists
        try:
            cursor.execute("SELECT balance FROM users LIMIT 1")
            print("Column 'balance' already exists.")
            cursor.fetchall()
        except mysql.connector.Error as err:
            if "Unknown column" in str(err):
                print("Adding 'balance' column to 'users' table...")
                cursor.execute("ALTER TABLE users ADD COLUMN balance INT DEFAULT 0")
                conn.commit()
                conn.commit()
                
        # Create visa_processes table
        print("Creating 'visa_processes' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS visa_processes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                client_email VARCHAR(255) NULL,
                type VARCHAR(50) NOT NULL,
                target_country VARCHAR(100) NOT NULL DEFAULT 'Estados Unidos',
                visa_category VARCHAR(100) NOT NULL DEFAULT 'B1/B2',
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

        # Check if schedule_names column exists in user_appointments
        try:
            cursor.execute("SELECT schedule_names FROM user_appointments LIMIT 1")
            print("Column 'schedule_names' already exists in 'user_appointments'.")
            cursor.fetchall()
        except mysql.connector.Error as err:
            if "Unknown column" in str(err):
                print("Adding 'schedule_names' column to 'user_appointments' table...")
                cursor.execute("ALTER TABLE user_appointments ADD COLUMN schedule_names VARCHAR(512) NULL DEFAULT NULL")
                conn.commit()

        # Check if assigned_consulate_date exists in user_appointments
        try:
            cursor.execute("SELECT assigned_consulate_date FROM user_appointments LIMIT 1")
            print("Column 'assigned_consulate_date' already exists in 'user_appointments'.")
            cursor.fetchall()
        except mysql.connector.Error as err:
            if "Unknown column" in str(err):
                print("Adding 'assigned_consulate_date' and 'assigned_cas_date' columns to 'user_appointments' table...")
                cursor.execute("ALTER TABLE user_appointments ADD COLUMN assigned_consulate_date DATETIME NULL DEFAULT NULL")
                cursor.execute("ALTER TABLE user_appointments ADD COLUMN assigned_cas_date DATETIME NULL DEFAULT NULL")
                conn.commit()

        # Create agency_profiles table
        print("Creating 'agency_profiles' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS agency_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                alias VARCHAR(100) NOT NULL UNIQUE,
                company_name VARCHAR(255) NOT NULL,
                logo_url VARCHAR(512) NULL,
                brand_color VARCHAR(50) DEFAULT '#4F46E5',
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        conn.commit()
                
        # Check if token exists in visa_processes
        try:
            cursor.execute("SELECT token FROM visa_processes LIMIT 1")
            print("Column 'token' already exists in 'visa_processes'.")
            cursor.fetchall()
        except mysql.connector.Error as err:
            if "Unknown column" in str(err):
                import uuid
                print("Adding 'token' column to 'visa_processes' table...")
                cursor.execute("ALTER TABLE visa_processes ADD COLUMN token VARCHAR(64) NULL UNIQUE")
                
                # Generate token for existing processes
                cursor.execute("SELECT id FROM visa_processes WHERE token IS NULL")
                rows = cursor.fetchall()
                for row in rows:
                    cursor.execute("UPDATE visa_processes SET token = %s WHERE id = %s", (str(uuid.uuid4()), row['id']))
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
