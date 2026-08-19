import sys, os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))
from config import DB_CONFIG
import mysql.connector

def check():
    db = mysql.connector.connect(**DB_CONFIG)
    cur = db.cursor()
    cur.execute("DESCRIBE users;")
    columns = cur.fetchall()
    print("Users columns:")
    for col in columns:
        print(col[0])
        
    try:
        cur.execute("DESCRIBE user_appointments;")
        columns = cur.fetchall()
        print("user_appointments columns:")
        for col in columns:
            print(col[0])
    except: pass
    
    cur.close()
    db.close()

if __name__ == "__main__":
    check()
