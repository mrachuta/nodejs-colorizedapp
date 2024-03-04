## General info

Basic Kubernetes cluster setup to run nodejs-colorizedapp

## Requirements

* Existing k8s cluster (example here: AKS)

## Usage
* Get cluster credentials
  ```
  az aks get-credentials --resource-group nodejscolorizedapp-rg --name myacrind01 --admin
  ```
* Create namespaces with istio-injection enabled:
  ```
  kubectl apply -f namespaces.yaml
  ```
* Deploy ingress-nginx:
  ```
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
  ```
  * Patch service and controller:
    ```
    kubectl patch service -n ingress-nginx ingress-nginx-controller -p '{"spec":{"externalTrafficPolicy":"Local"}}'
    ```
    ```
    kubectl patch deployment -n ingress-nginx ingress-nginx-controller -p '{"spec":{"template":{"metadata":{"annotations":{"traffic.sidecar.istio.io/includeInboundPorts":""}}}}}'
    ```
* Deploy cert-manager:
  ```
  kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.1/cert-manager.yaml
  ```
* Cert manager basic setup (Let's encrypt)
  * Set correct e-mail in yaml file:
    ```
    sed -i 's/admin@mydomain.com/me@insanedomain.com/g' letsencrypt-staging-clusterissuer.yaml
    ```
  * Create clusterIssuer object:
    ```
    kubectl apply -f letsencrypt-staging-clusterissuer.yaml
    ```
  * This is staging certificate; if you want to create prod certificate use Let's Encrypt prod API: *https://acme-v02.api.letsencrypt.org/directory*
* Install istio form custom manifest (no loadBalancer will be deployed):
  ```
  kubectl apply -f ./istio-generated-manifest-no-loadbalancer.yaml
  ```
* Restart nginx-ingress to attach istio sidecar
  ```
  kubectl rollout restart -n ingress-nginx deployment ingress-nginx-controller
  ```
* Deploy nodejs-colorizedapp using helm chart
  * Create yaml file basing on [dev-env.yaml](../../helm/environments/dev-env.yaml), for example *my-dev-env.yaml*
    * If you need to create registry secret to access ACR from AKS you can use existing service principal (https://learn.microsoft.com/en-us/azure/container-registry/container-registry-authentication?tabs=azure-cli#service-principal) or ACR admin account (WARNING, it's unsafe: https://learn.microsoft.com/en-us/azure/container-registry/container-registry-authentication?tabs=azure-cli#admin-account)
  * Run following command:
    ```
    helm upgrade --install nodejs-colorizedapp ./helm/nodejs-colorizedapp/ \
    --wait \
    --timeout 10m \
    --atomic \
    --namespace dev-env \
    --values ./helm/nodejs-colorizedapp/values.yaml \
    --values ./helm/environments/my-dev-env.yaml \
    --set deployments.d1.weight=50 \
    --set deployments.d2.weight=50
    ```
