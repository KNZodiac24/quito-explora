FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src/

# Crear directorio para uploads
RUN mkdir -p /app/uploads

EXPOSE 3002

CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
