FROM docker.io/node:20-slim AS deps

WORKDIR /app

COPY package*.json .
COPY prisma/ .

RUN npm ci --ignore-scripts

FROM docker.io/node:20-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules .
COPY --from=deps /app/package*.json .
COPY . .

RUN npm run build --ignore-scripts
RUN npm run prisma-gen
RUN npm prune --omit=dev

FROM docker.io/node:20-slim AS prod

WORKDIR /app

COPY --from=builder /app/dist .
COPY --from=deps /app/package*.json .
COPY prisma .

EXPOSE 3000

CMD [ "node", "dist/main" ]