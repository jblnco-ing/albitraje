# --- STAGE 1: Builder (Build) ---
FROM node:22-alpine AS builder

# Instalamos herramientas necesarias para compilar módulos nativos si fuera necesario
RUN apk add --no-cache make gcc g++ python3 zeromq-dev

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Copiamos código y compilamos
COPY tsconfig.json index.ts ./
RUN npm run build

# --- STAGE 2: Runner (Runtime) ---
FROM node:22-alpine AS runner

# Instalamos solo la librería de runtime de zeromq
RUN apk add --no-cache libzmq

WORKDIR /app

# Copiamos package.json para que npm start funcione
COPY --from=builder /app/package.json ./

# Instalamos SOLO dependencias de producción para ahorrar espacio y RAM
# Esto evita llevar TypeScript y otras herramientas de desarrollo a la VM
RUN npm ci --omit=dev

# Copiamos el código compilado
COPY --from=builder /app/dist ./dist

# Configuración de producción
ENV NODE_ENV=production
# Limitar la memoria heap de Node (muy importante en e2-micro)
ENV NODE_OPTIONS="--max-old-space-size=256"

# Exponer puertos del Ingestor (ZMQ y Dashboard)
EXPOSE 5555 3000

CMD ["npm", "start"]
