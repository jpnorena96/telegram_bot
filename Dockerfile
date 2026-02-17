FROM python:3.9-slim

WORKDIR /app

# Install system dependencies if any are needed (e.g. for mysqlclient)
# RUN apt-get update && apt-get install -y default-libmysqlclient-dev build-essential

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY telegram_data_bot.py .
# Copy config files if needed, though better to use ENV variables
# COPY config . 

# Set environment variables (Defaults can be overridden in Easypanel)
ENV VISA_DB_HOST=173.212.225.148
ENV VISA_DB_USER=root
ENV VISA_DB_PASS=Cvpm1234
ENV VISA_DB_NAME=visa_bot_db_telegram
# ENV TELEGRAM_BOT_TOKEN=... (Set this in Easypanel secrets)

CMD ["python", "telegram_data_bot.py"]
