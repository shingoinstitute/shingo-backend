#!/bin/bash

TAG=$1
PORT=$2

if [ -z "$1" ]; then
    TAG="local"
fi
if [ -z "$2" ]; then
    PORT=3001;
fi

# if [ -z "$SF_CLIENT" ]; then
#     echo "Need the SF_CLIENT env variable to be defined..."
#     exit 1
# fi

# if [ -z "$SF_SECRET" ]; then
#     echo "Need the SF_PASS env variable to be defined..."
#     exit 1
# fi

# if [ -z "$SF_CALLBACK" ]; then
#     echo "Need the SF_CALLBACK env variable to be defined..."
#     exit 1
# fi

docker build --tag shingo-api:${TAG} .

docker network create shingo-dev-net

docker kill shingo-mysql-local
docker rm shingo-mysql-local

docker run -itd                                 \
    --name shingo-mysql-local                   \
    -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASS}   \
    --volume /var/lib/mysql:/var/lib/mysql:rw   \
    --network shingo-dev-net                    \
    mysql:5.7

docker kill shingo-api
docker rm shingo-api

docker run -itd                             \
    -e MYSQL_USER=root                      \
    -e MYSQL_PASS=${MYSQL_ROOT_PASS}        \
    -e MYSQL_URL=${MYSQL_URL}               \
    --name shingo-api                       \
    --network shingo-dev-net                \
    --volume $(pwd):/code                   \
    shingo-api:${TAG}