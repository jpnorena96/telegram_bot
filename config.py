import os
from dotenv import load_dotenv

load_dotenv()

# Telegram Bot Token
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# Database Configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASS"),
    "database": os.getenv("DB_NAME"),
}

# VPS SSH Configuration
VPS_HOST = os.getenv("VPS_HOST")
VPS_USER = os.getenv("VPS_USER")
VPS_PASS = os.getenv("VPS_PASS")
