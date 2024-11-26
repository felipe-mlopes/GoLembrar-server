FROM alpine:3.20 AS builder

WORKDIR /app

RUN apk --no-cache update && apk add nodejs npm

COPY package*.json .
COPY /prisma .

RUN npm ci
RUN npm run prisma-gen

COPY . .

RUN npm run build

RUN npm prune --omit=dev

FROM alpine:3.20 AS production

WORKDIR /app

RUN apk --no-cache update && apk add nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/.env .

EXPOSE 3000

CMD ["node", "dist/main"]