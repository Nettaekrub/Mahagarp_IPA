FROM node:18-alpine

RUN apk add --no-cache iputils busybox-extras

WORKDIR /app
COPY package*.json ./

RUN npm install --production

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD [ "node", "server.js" ]