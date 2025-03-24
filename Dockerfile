# Base
FROM node:lts-slim AS base

WORKDIR /app

COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile

# Builder
FROM base AS builder

COPY src src
COPY tsconfig.json .

RUN yarn build

# API image
FROM base AS api

COPY --from=builder /app/dist .

EXPOSE 3000

CMD ["node", "api.js"]

# Worker image
FROM base AS worker

COPY --from=builder /app/dist .

CMD ["node", "worker.js"]
