FROM node:lts-slim

WORKDIR /app

COPY . .
RUN yarn install --frozen-lockfile

CMD ["yarn", "run", "demo"]
