FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ git

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npx", "ts-node", "-r", "dotenv/config", "src/run.ts"]
