FROM docker.io/library/node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma/ ./

RUN npm ci --only=production --ignore-scripts

COPY . ./

RUN npm run build

RUN npm prune --production

FROM docker.io/library/node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD [ "node", "dist/main" ]