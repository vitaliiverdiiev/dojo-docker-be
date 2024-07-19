# syntax:docker/dockerfile:1

FROM node:20.15.1-alpine AS base
WORKDIR /app
COPY ["package.json", "yarn.lock*", "./"] 

# DEVELOPMENT
FROM base AS development
ENV NODE_ENV=development
RUN yarn install --frozen-lockfile
COPY . .
CMD ["yarn", "start:dev"]

# TEST
FROM development AS test
ENV NODE_ENV=test
CMD ["yarn", "test"]

# TEST COV
FROM test AS test-cov
CMD ["yarn", "test:cov"]

# TEST WATCH
FROM test AS test-watch
ENV GIT_WORK_TREE=/app GIT_DIR=/app/.git
RUN apk add git
CMD ["yarn", "test:watch"]

FROM base AS production
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --production
COPY . .
RUN yarn add global @nestjs/cli
RUN yarn build
CMD ["yarn", "start:prod"]