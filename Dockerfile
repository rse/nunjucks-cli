##
##  Dockerfile -- Docker Build Configuration
##

#   build arguments (early)
ARG         IMAGE_PREFIX=ghcr.io/rse/
ARG         IMAGE_NAME=nunjucks-cli
ARG         IMAGE_VERSION=2.1.0
ARG         IMAGE_RELEASE=20251226
ARG         IMAGE_ALIAS=latest

#   derive image from a certain base image
FROM        node:24-alpine3.23

#   link to Github repository
LABEL       org.opencontainers.image.source=https://github.com/rse/nunjucks-cli
LABEL       org.opencontainers.image.description="Nunjucks Template Rendering Command-Line Interface"

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
                @rse/nunjucks-cli \
                @rse/nunjucks-addons

#   cleanup Alpine
RUN         rm -rf /var/cache/apk/*

#   switch to run-time user
USER        app:app

#   provide entrypoint
ENTRYPOINT  [ "nunjucks" ]

