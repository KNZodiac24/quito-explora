FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src/

EXPOSE 3003

CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
