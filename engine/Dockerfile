# --- STAGE 1: Constructor ---
FROM python:3.11-slim AS builder

WORKDIR /app

# Instalar dependencias para compilar módulos nativos
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Crear un entorno virtual para aislar las dependencias
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- STAGE 2: Corredor ---
FROM python:3.11-slim AS runner

# Crear usuario de sistema para no correr como root
RUN groupadd -r sniper && useradd -r -g sniper sniper

WORKDIR /app

# Copiar el entorno virtual desde el builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copiar el código
COPY . .

# Asegurar permisos
RUN chown -R sniper:sniper /app
USER sniper

CMD ["python", "main.py"]
