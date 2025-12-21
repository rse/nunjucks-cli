##
##  Dockerfile -- Docker Build Configuration
##

#   build arguments (early)
ARG         IMAGE_PREFIX=docker.io/engelschall/
ARG         IMAGE_NAME=nunjucks-cli
ARG         IMAGE_VERSION=2.0.0
ARG         IMAGE_RELEASE=20251221
ARG         IMAGE_ALIAS=latest

#   derive image from a certain base image
FROM        node:24-alpine3.23

#   add additional build tools
RUN         apk update && \
            apk upgrade

#   establish application area and user/group
RUN         mkdir -p /app && \
            apk add --no-cache --virtual .deps1 shadow && \
            groupadd -g 2000 app && \
            useradd -u 2000 -g app -d /app -m -s /bin/bash -p '!' -l app && \
            apk del .deps1 && \
            chown -R app:app /app
WORKDIR     /app
ENV         HOME=/app

#   install tool
RUN         npm install -g \
                @rse/nunjucks-cli@1.5.2 \
                @rse/nunjucks-addons@1.0.8

#   cleanup Alpine
RUN         rm -rf /var/cache/apk/*

#   switch to run-time user
USER        app:app

#   provide entrypoint
ENTRYPOINT  [ "nunjucks" ]

