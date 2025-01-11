#### 1st stage
FROM node:lts-alpine AS builder

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

#### 2nd stage
FROM node:lts-slim AS production

ENV NODE_ENV=production
USER node

# Create app directory
WORKDIR /app

# Install app dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/js ./js

RUN npm ci --omit=dev

CMD [ "node", "js/index.js" ]