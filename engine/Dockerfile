# --- STAGE 1: Constructor ---
# Usamos la imagen oficial de astral-sh/uv para máxima velocidad
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim AS builder

# Evitar que uv cree un venv por defecto, instalamos en el sistema del builder
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar uvloop/pyzmq
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY pyproject.toml uv.lock ./
# Sincronizamos e instalamos las dependencias
RUN uv sync --frozen --no-dev --no-install-project

# --- STAGE 2: Corredor ---
FROM python:3.11-slim-bookworm AS runner

# Seguridad: usuario no-root
RUN groupadd -r sniper && useradd -r -g sniper sniper

WORKDIR /app

# Copiamos el entorno instalado por 'uv'
COPY --from=builder /app/.venv /app/.venv

# Seteamos el PATH para usar el entorno de uv
ENV PATH="/app/.venv/bin:$PATH"

# Copiamos el código
COPY main.py .

# Permisos
RUN chown -R sniper:sniper /app
USER sniper

CMD ["python", "main.py"]
