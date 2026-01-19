FROM node:18-alpine

WORKDIR /app

# Instalar dependencias para compilar ZeroMQ si es necesario (generalmente prebuilts funcionan, pero por seguridad en alpine)
RUN apk add --no-cache make gcc g++ python3 zeromq-dev

COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
