# 1. Install dependencies (production and development)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2. Copy application files and build
FROM node:22-alpine AS build
WORKDIR /app

# ✅ Define build-time environment variables
ARG VITE_API_BASE_URL
ARG VITE_API_VERSION
ARG VITE_NODE_ENV
ARG VITE_ENABLE_LOGGING

# ✅ Inject variables into the build environment
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_VERSION=$VITE_API_VERSION
ENV VITE_NODE_ENV=$VITE_NODE_ENV
ENV VITE_ENABLE_LOGGING=$VITE_ENABLE_LOGGING

COPY . .
COPY --from=deps /app/node_modules ./node_modules

# ✅ Embed env variables during the build
RUN npm run build

# 3. Production server (SSR via react-router-serve)
FROM node:22-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/build ./build

EXPOSE 3000


CMD ["npm", "run", "start"]
