#!/bin/bash
docker build -t https-graphql-apigateway .
docker tag https-graphql-apigateway rafaelpernil/https-graphql-apigateway:latest
docker push rafaelpernil/https-graphql-apigateway:latest

kubectl apply -f ./artifacts/deployment.yaml
kubectl apply -f ./artifacts/service.yaml

kubectl scale --replicas=0 deployment https-graphql-apigateway -n allotr
kubectl scale --replicas=2 deployment https-graphql-apigateway -n allotr