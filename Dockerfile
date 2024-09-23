FROM node:20.11.1-bullseye-slim

RUN apt-get update && apt-get install -y openssl && apt-get install -y ca-certificates
RUN apt-get update && apt-get install -y libxtst6 libxrandr2 libglib2.0-0 libgtk2.0-0 libpulse0 libgdk-pixbuf2.0-0 libnss3-dev libatk-bridge2.0-0 libdrm-dev libxkbcommon-x11-0 libgbm-dev libasound2

COPY . /app
WORKDIR /app

RUN npm ci --omit=dev --ignore-scripts
RUN npm install cpx

#RUN npx prisma migrate deploy
RUN npm run prisma:generate
RUN npm run build
RUN npm rebuild

CMD ["node","/app/dist/src/main.js"]
