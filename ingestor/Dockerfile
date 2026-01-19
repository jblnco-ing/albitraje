# --- STAGE 1: Constructor (Build) ---
FROM node:22-alpine AS builder

WORKDIR /app

# Instalamos herramientas de compilación
RUN apk add --no-cache make gcc g++ python3 zeromq-dev

COPY package.json package-lock.json* ./
RUN npm install

# Copiamos código fuente y config TS
COPY tsconfig.json index.ts ./

# COMPILAMOS: Genera la carpeta dist/ con JS
RUN npm run build

# --- STAGE 2: Corredor (Runtime) ---
# Usamos una imagen limpia
FROM node:22-alpine AS runner

USER node
WORKDIR /home/node/app

USER root
RUN apk add --no-cache zeromq-dev
USER node

# Copiamos dependencias (node_modules)
COPY --from=builder /app/node_modules ./node_modules
# Copiamos package.json
COPY --from=builder /app/package.json ./package.json
# Copiamos SOLO el código compilado (dist)
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["npm", "start"]
