import requests
from bs4 import BeautifulSoup
import urllib.parse
import os
import mysql.connector

# DB Credentials
DB_HOST = "173.212.225.148"
DB_USER = "root"
DB_PASS = "Cvpm1234"
DB_NAME = "visa_bot_db_telegram"

def get_test_users():
    conn = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT email, password FROM user_appointments LIMIT 5")
    users = cursor.fetchall()
    conn.close()
    return users

def debug_login():
    users = get_test_users()
    if not users:
        print("No users in DB")
        return
        
    for user in users:
        email = user["email"]
        password = user["password"]
        country = "co"
        url = f"https://ais.usvisa-info.com/en-{country}/niv"
        
        print(f"\nTesting with {email} for {country}")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 YaBrowser/24.1.0.0 Safari/537.36',
    })

    # PROXY (Optional, you can test without it for now)
    
    res = session.get(f"{url}/users/sign_in")
    csrf = BeautifulSoup(res.text, 'html.parser').find('meta', {'name': 'csrf-token'})['content']
    
    res = session.post(f"{url}/users/sign_in", data={
        "user[email]": email,
        "user[password]": password,
        "policy_confirmed": "1",
        "commit": "Sign In"
    }, headers={
        "X-CSRF-Token": csrf,
        "Referer": f"{url}/users/sign_in"
    })
    
    # After sign-in, it should redirect to the dashboard
    res2 = session.get(url)
    
    with open("debug_page.html", "w", encoding="utf-8") as f:
        f.write(res2.text)
        
    apps = BeautifulSoup(res2.text, 'html.parser').find_all('div', {'class': 'application'})
    print(f"Found applications count: {len(apps)}")
    if res2.text.find("Invalid email or password.") != -1:
         print("Invalid credentials.")
    elif res2.text.find("Sign In") != -1:
         print("Still on sign in page!")
    else:
         print("Looks like we are on dashboard")

if __name__ == "__main__":
    debug_login()
