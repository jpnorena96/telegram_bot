import mysql.connector

def alter_db():
    conn = mysql.connector.connect(
        host="173.212.225.148",
        user="root",
        password="Cvpm1234",
        database="visa_bot_db_telegram"
    )
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE visa_applicants ADD COLUMN ds160_json LONGTEXT NULL DEFAULT NULL AFTER form_data;")
        conn.commit()
        print("Column ds160_json added successfully.")
    except Exception as e:
        print(f"Error (maybe it already exists?): {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    alter_db()
