FROM node:20-alpine

WORKDIR /app

# Instalar dependencias de compilación para bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src/

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
