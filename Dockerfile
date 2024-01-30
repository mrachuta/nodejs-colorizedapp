FROM node:20.10-alpine

LABEL version="1.0"
LABEL maintainer="mrachuta"

RUN adduser -s /bin/bash -u 20000 nodejs -D && \
    mkdir /app && \
    chown -R nodejs:nodejs /app

WORKDIR /app

USER nodejs

COPY --chown=20000:20000 package*.json ./
COPY --chown=20000:20000 app.js ./

RUN npm ci --omit=dev

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s \
  CMD curl --fail http://localhost:3000/live || exit 1

CMD [ "node", "app.js" ]
