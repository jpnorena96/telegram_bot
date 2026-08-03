import mysql.connector
from backend.config import DB_CONFIG

conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor()
cursor.execute("DESCRIBE visa_processes")
for row in cursor.fetchall():
    print(row)
