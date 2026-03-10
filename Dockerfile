FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for paramiko (SSH)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY telegram_data_bot.py .

# Set environment variables (can be overridden in Easypanel)
ENV VISA_DB_HOST=173.212.225.148
ENV VISA_DB_USER=root
ENV VISA_DB_PASS=Cvpm1234
ENV VISA_DB_NAME=visa_bot_db_telegram
# ENV TELEGRAM_BOT_TOKEN=... (Set this in Easypanel secrets)

CMD ["python", "telegram_data_bot.py"]
