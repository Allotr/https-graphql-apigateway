#!/bin/bash
docker tag https-graphql-apigateway rafaelpernil/https-graphql-apigateway
docker buildx build --push --platform linux/arm64,linux/amd64  --tag rafaelpernil/https-graphql-apigateway .

