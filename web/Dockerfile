FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Expose Astro port
EXPOSE 4321

CMD ["npm", "run", "dev"]
