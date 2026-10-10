FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY models ./models

USER node

EXPOSE 3000

CMD ["node", "server.js"]