FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for paramiko (SSH)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY config.py .
COPY main.py .
COPY backend/ ./backend/
COPY bot/ ./bot/

# Copy VPS scripts
COPY script.py .
COPY script_requirements.txt .
COPY restart_pm2.sh .

# ENV variables should be injected by Easypanel directly.

CMD ["python", "main.py"]
