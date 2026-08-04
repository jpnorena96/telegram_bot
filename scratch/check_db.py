import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.db import get_db

db = next(get_db())
cursor = db.cursor(dictionary=True)
try:
    cursor.execute("DESCRIBE agency_profiles")
    print(cursor.fetchall())
except Exception as e:
    print(f"Error: {e}")
