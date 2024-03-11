##
##  Makefile: Docker Build Procedure
##

#   ==== DEFAULT ====
#   default build target
TARGETS ?= build
all: $(TARGETS)

#   ==== COMMON ====
#   configuration of container image
DOCKER_IMAGE_CONFIG ?= __dummy=1
IMAGE_CONFIG = \
	IMAGE_PREFIX=`egrep "ARG.*IMAGE_PREFIX" Dockerfile | sed -e 's;^.*=;;' | head -1` && \
	IMAGE_NAME=`egrep "ARG.*IMAGE_NAME" Dockerfile | sed -e 's;^.*=;;' | head -1` && \
	IMAGE_VERSION=`egrep "ARG.*IMAGE_VERSION" Dockerfile | sed -e 's;^.*=;;' | head -1` && \
	IMAGE_RELEASE=`egrep "ARG.*IMAGE_RELEASE" Dockerfile | sed -e 's;^.*=;;' | head -1` && \
	IMAGE_ALIAS=`egrep "ARG.*IMAGE_ALIAS" Dockerfile | sed -e 's;^.*=;;' | head -1` && \
	$(DOCKER_IMAGE_CONFIG)

#   ==== BUILD ====
#   (re)build a container image
DOCKER_BUILD_FLAGS ?= --pull --no-cache
build: Dockerfile
	@$(IMAGE_CONFIG) && \
	echo "++ building Docker image $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE} ($${IMAGE_ALIAS})" && \
	docker build \
	    $(DOCKER_BUILD_FLAGS) \
	    --build-arg "IMAGE_PREFIX=$${IMAGE_PREFIX}" \
	    --build-arg "IMAGE_NAME=$${IMAGE_NAME}" \
	    --build-arg "IMAGE_VERSION=$${IMAGE_VERSION}" \
	    --build-arg "IMAGE_RELEASE=$${IMAGE_RELEASE}" \
	    --build-arg "IMAGE_ALIAS=$${IMAGE_ALIAS}" \
	    -t $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_ALIAS} \
	    -t $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION} \
	    -t $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE} \
	    -f Dockerfile . && \
	docker image ls $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE}

#   ==== RUN ====
#   run a container image
DOCKER_RUN_FLAGS ?= --rm -i -t -e TERM --init
DOCKER_RUN_ARGS  ?=
run:
	@$(IMAGE_CONFIG) && \
	echo "++ running Docker image $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE}" && \
	docker run \
	    --name "$${IMAGE_NAME}-temp" \
		$(DOCKER_RUN_FLAGS) \
	    $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE} \
		$(DOCKER_RUN_ARGS)

#   ==== INSPECT ====
#   inspect a container image
DOCKER_INSPECT_FLAGS ?= --rm -i -t -e TERM -u root --entrypoint "/bin/bash"
DOCKER_INSPECT_ARGS  ?=
inspect:
	@$(IMAGE_CONFIG) && \
	echo "++ inspecting Docker image $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE}" && \
	docker run \
	    --name "$${IMAGE_NAME}-temp" \
		$(DOCKER_INSPECT_FLAGS) \
	    $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE} \
		$(DOCKER_INSPECT_ARGS)

#   ==== EXEC ====
#   enter a running container image
DOCKER_EXEC_FLAGS ?= -i -t -e TERM
DOCKER_EXEC_ARGS  ?= /bin/bash
exec:
	@$(IMAGE_CONFIG) && \
	echo "++ executing command in Docker container of Docker image $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE}" && \
	docker exec \
	    $(DOCKER_EXEC_FLAGS) \
		`docker ps --filter "ancestor=$${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE}" --format "{{ .ID }}"` \
		$(DOCKER_EXEC_ARGS)

#   ==== PUSH ====
#   push container image to registry
push:
	@$(IMAGE_CONFIG) && \
	echo "++ pushing Docker image $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE} ($${IMAGE_ALIAS})" && \
	docker push $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE} && \
	docker push $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION} && \
	docker push $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_ALIAS}

#   ==== CLEAN ====
#   remove container image
clean:
	@$(IMAGE_CONFIG) && \
	echo "++ removing Docker image $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE} ($${IMAGE_ALIAS})" && \
	docker image rm $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION}-$${IMAGE_RELEASE} >/dev/null 2>&1 || true && \
	docker image rm $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_VERSION} >/dev/null 2>&1 || true && \
	docker image rm $${IMAGE_PREFIX}$${IMAGE_NAME}:$${IMAGE_ALIAS} >/dev/null 2>&1 || true && \

#   ==== PRUNE ====
#   prune entire Docker environment
prune:
	@echo "++ pruning Docker environment"
	docker container prune -f
	docker network prune -f
	docker volume prune -f
	docker image prune -f

