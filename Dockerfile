FROM node:18-alpine As development
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .
USER node

FROM node:18-alpine As build
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build
ENV NODE_ENV production
RUN npm ci --only=production && npm cache clean --force
USER node

FROM node:18-alpine As production
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
CMD [ "node", "dist/main.js" ]

# # syntax:docker/dockerfile:1

# FROM node:20.15.1-alpine AS base
# WORKDIR /app
# COPY ["package.json", "yarn.lock*", "./"]

# # DEVELOPMENT
# FROM base AS development
# ENV NODE_ENV=development
# RUN yarn install --frozen-lockfile
# COPY . .
# CMD ["yarn", "start:dev"]

# # TEST
# FROM development AS test
# ENV NODE_ENV=test
# CMD ["yarn", "test"]

# # TEST COV
# FROM test AS test-cov
# CMD ["yarn", "test:cov"]

# # TEST WATCH
# FROM test AS test-watch
# ENV GIT_WORK_TREE=/app GIT_DIR=/app/.git
# RUN apk add git
# CMD ["yarn", "test:watch"]

# FROM base AS production
# ENV NODE_ENV=production
# RUN yarn install --frozen-lockfile --production
# COPY . .
# RUN yarn add global @nestjs/cli
# RUN yarn build
# CMD ["yarn", "start:prod"]
