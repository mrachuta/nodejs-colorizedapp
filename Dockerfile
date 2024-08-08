# Node 20.xx
FROM node:lts-alpine

ARG build_id \
    app_version

LABEL build_id=$build_id \
      app_version=$app_version \
      maintainer="mrachuta"

# Set ENV basing on ARG
ENV BUILD_ID=$build_id \
    APP_VERSION=$app_version

RUN adduser -s /bin/bash -u 20000 nodejs -D && \
    mkdir /app && \
    chown -R nodejs:nodejs /app

WORKDIR /app

USER nodejs

COPY --chown=20000:20000 package*.json ./
COPY --chown=20000:20000 src/app.js ./

RUN npm ci --omit=dev

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s \
  CMD curl --fail http://localhost:3000/live || exit 1

CMD [ "node", "app.js" ]
