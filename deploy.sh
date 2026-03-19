#!/bin/bash
kubectl apply -f ./artifacts/deployment.yaml
kubectl apply -f ./artifacts/service.yaml

kubectl scale --replicas=0 deployment https-graphql-apigateway -n allotr
kubectl scale --replicas=1 deployment https-graphql-apigateway -n allotr