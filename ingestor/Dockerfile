# --- STAGE 1: Constructor (Build) ---
FROM node:18-alpine AS builder

WORKDIR /app

# Instalamos herramientas de compilación solo para construir módulos nativos (ZeroMQ)
RUN apk add --no-cache make gcc g++ python3 zeromq-dev

COPY package.json package-lock.json* ./

# Instalamos todas las dependencias
RUN npm install

# --- STAGE 2: Corredor (Runtime) ---
FROM node:18-alpine AS runner

# Nodo produce su propio usuario 'node' por seguridad, usémoslo
USER node
WORKDIR /home/node/app

# Solo copiamos el socket de ZeroMQ del sistema si es necesario (Alpine lo necesita para la lib compartida)
# Pero como usamos la versión precompilada de zeromq.js, usualmente basta con el runtime de node.
# Sin embargo, instalamos la librería compartida de zeromq para estabilidad.
USER root
RUN apk add --no-cache zeromq-dev
USER node

# Copiamos solo lo esencial desde la etapa de construcción
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copiamos nuestro código fuente
COPY . .

# Optimizamos Node para producción
ENV NODE_ENV=production

CMD ["node", "index.js"]
