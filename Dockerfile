# syntax:docker/dockerfile:1

FROM node:20.15.1-alpine AS base
WORKDIR /app
COPY ["package.json", "package-lock*", "./"]

# DEVELOPMENT
FROM base AS development
ENV NODE_ENV=development
RUN nom install --frozen-lockfile
COPY . .
CMD ["npm", "run", "start:dev"]

FROM base AS production
ENV NODE_ENV=production
RUN npm install --frozen-lockfile --production
COPY . .
RUN npm i -g @nestjs/cli
RUN npm run build
CMD ["npm", "run", "start:prod"]
