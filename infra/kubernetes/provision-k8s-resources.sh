#!/usr/bin/env bash

set -euo pipefail

CERT_MANAGER_VER='v1.13.1'
#NGINX_INGRESS_VER='v1.8.2'

echo 'Creating namespaces with istio-injection enabled'
kubectl apply -f ./namespaces.yaml

echo "Applying cert manager version ${CERT_MANAGER_VER}"
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/${CERT_MANAGER_VER}/cert-manager.yaml
echo 'Finished, sleep for 30 seconds'
sleep 30

echo 'Applying cert-manager clusterissuer'
kubectl apply -f ./letsencrypt-staging-clusterissuer.yaml

echo 'Unpack istio resources from tar file'
tar -xvf istio-resources.tar

# Istio contains no loadbalancer object
echo 'Applying istio custom manifest'
kubectl apply -f ./istio-generated-manifest-no-loadbalancer.yaml
sleep 30

echo 'Reloading ingress-nginx to attach istio-sidecar'
kubectl rollout restart -n ingress-nginx deployment ingress-nginx-controller

echo 'Installing istio addons'
kubectl apply -f istio-addons/prometheus.yaml
sleep 30
kubectl apply -f istio-addons/grafana.yaml
sleep 30
kubectl apply -f istio-addons/kiali.yaml
sleep 30

# # Uncomment for bare-metal k8s
# echo 'Applying secrets'
# kubectl apply -f ./acr-registry-secret-dev-env.yaml 
# kubectl apply -f ./acr-registry-secret-uat-env.yaml
# kubectl apply -f ./acr-registry-secret-prod-env.yaml

# # No longer required as it is handled by terraform and helm provider
# echo "Applying ingress-nginx version ${NGINX_INGRESS_VER}"
# kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-${NGINX_INGRESS_VER}/deploy/static/provider/cloud/deploy.yaml
# echo 'Sleep for 30 seconds'
# sleep 30

echo 'Getting loadBalancer IP address...'
until kubectl get svc ingress-nginx-controller -n ingress-nginx \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}' |
  grep -m 1 -E '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'; do
  echo 'Sleeping for 5 seconds...'
  sleep 5
done
