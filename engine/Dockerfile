# --- STAGE 1: Constructor ---
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim AS builder

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app

# Instalar solo lo estrictamente necesario para compilar (uvloop/pyzmq)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# --- STAGE 2: Corredor ---
FROM python:3.11-slim-bookworm AS runner

# Optimizaciones de memoria para Python en entornos pequeños (e2-micro)
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
# Limitar arenas de memoria para evitar fragmentación en 1GB RAM
ENV MALLOC_ARENA_MAX=2

# Seguridad
RUN groupadd -r sniper && useradd -r -g sniper sniper

WORKDIR /app

# Copiamos el entorno virtual optimizado
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

COPY main.py .

RUN chown -R sniper:sniper /app
USER sniper

CMD ["python", "main.py"]
