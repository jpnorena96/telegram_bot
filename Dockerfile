FROM python:3.12-slim

# ── System dependencies ───────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        libffi-dev \
        libssl-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# ── Non-root user for security ────────────────────────────────────────────────
RUN useradd -m -u 1000 botuser

WORKDIR /app

# ── Install Python dependencies first (better layer caching) ──────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy source code ──────────────────────────────────────────────────────────
COPY config.py .
COPY main.py .
COPY backend/ ./backend/
COPY bot/ ./bot/

# ── VPS scripts (se suben al VPS, no corren dentro del contenedor) ─────────────
COPY script.py .
COPY script_requirements.txt .

# ── Set correct ownership ─────────────────────────────────────────────────────
RUN chown -R botuser:botuser /app

USER botuser

# ── Healthcheck: verify Python process is alive ───────────────────────────────
HEALTHCHECK --interval=60s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import sys; sys.exit(0)" || exit 1

# ── ENV variables injected at runtime (Easypanel / docker-compose) ────────────

CMD ["python", "-u", "main.py"]
