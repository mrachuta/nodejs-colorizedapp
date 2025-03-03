## General info
An Istio deployment via kustomize to be used as service mesh inside kubernetes cluster to enhance control, security and observability over nodejs-colorizedapp.
Provided configuration is not using *Gateway* kubernetes object to manage incoming traffic. Configuration is dedicated to co-exist with ingress-nginx within cluster.
More information here:
* https://discuss.istio.io/t/istio-without-gateway-with-nginx-ingress/593/7
* https://github.com/bob-walters/nginx-istio

## Requirements
Run following commands to get istioctl and generate basic manifest:
```
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.24.2 sh -
./istio-1.24.2/bin/istioctl manifest generate \
--set profile=minimal \
--set values.gateways.istio-ingressgateway.enabled=false \
--set values.gateways.istio-egressgateway.enabled=true \
--set meshConfig.enableTracing=true > istio.yaml
cp -rp ./istio-1.24.2/samples/addons ./infra/kubernetes/istio/
```

## Installation
Generate manifest:
```
kubectl kustomize .
```
Install Istio:
```
kubectl apply -k .
```

## Useful commands

Kiali dashboard
```
./istio-1.24.2/bin/istioctl dashboard kiali
```
Grafana dashboard
```
./istio-1.24.2/bin/istioctl dashboard grafana
```
