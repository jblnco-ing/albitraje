# --- STAGE 1: Constructor ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar solo archivos de dependencias para aprovechar cache
COPY package.json package-lock.json* ./
RUN npm install

# Copiar el resto del código
COPY . .

# Construir el proyecto
RUN npm run build

# --- STAGE 2: Corredor ---
FROM node:22-alpine AS runner

WORKDIR /app

# Copiamos solo lo necesario para producción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Usamos el usuario node para mayor seguridad
USER node

# Exponemos el puerto de Astro
EXPOSE 4321

# Corremos la previsualización de producción
CMD ["npm", "start"]
