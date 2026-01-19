# --- STAGE 1: Constructor ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar solo archivos de dependencias para aprovechar cache
COPY package.json package-lock.json* ./
RUN npm install

# Copiar el resto del código
COPY . .

# --- STAGE 2: Corredor ---
FROM node:22-alpine AS runner

# Definimos el directorio de trabajo en la home del usuario node
WORKDIR /home/node/app

# Copiamos todo desde el builder con el dueño correcto
COPY --from=builder --chown=node:node /app .

# Forzamos la creación de la carpeta de caché de Astro con los permisos correctos
RUN mkdir -p /home/node/app/.astro && chown -R node:node /home/node/app/.astro

# Usamos el usuario node para mayor seguridad
USER node

# Exponemos el puerto de Astro
EXPOSE 4321

# IMPORTANTE: Eliminamos el doble --host para evitar conflictos en el CLI de Astro
# 'npm run dev' ya tiene '--host' en el package.json
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
