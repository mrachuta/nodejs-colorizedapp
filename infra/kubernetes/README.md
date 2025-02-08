## General info

Basic Kubernetes cluster setup to run nodejs-colorizedapp

## Requirements

* Existing k8s cluster (example here: AKS)

## Usage

### Namespaces

* Get cluster credentials
  ```
  az aks get-credentials --resource-group nodejscolorizedapp-rg --name myaksind01 --admin
  ```
* Create namespaces with istio-injection enabled:
  ```
  kubectl apply -f namespaces.yaml
  ```

### ingess-nginx

* Deploy ingress-nginx (if not deployed previously via Terraform module!):
  ```
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml
  ```
* Patch service and controller:
  ```
  kubectl patch service -n ingress-nginx ingress-nginx-controller -p '{"spec":{"externalTrafficPolicy":"Local"}}'
  ```
  ```
  kubectl patch deployment -n ingress-nginx ingress-nginx-controller -p '{"spec":{"template":{"metadata":{"annotations":{"traffic.sidecar.istio.io/includeInboundPorts":""}}}}}'
    ```
### cert-manager

* Deploy cert-manager:
  ```
  kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.17.0/cert-manager.yaml
  ```
* Adjust ClusterIssuer set correct e-mail in yaml file:
  ```
  mv letsencrypt-staging-clusterissuer-example.yaml letsencrypt-staging-clusterissuer.yaml 
  sed -i 's/admin@mydomain.com/me@insanedomain.com/g' letsencrypt-staging-clusterissuer.yaml
  ```
* Create ClusterIssuer object:
  ```
  kubectl apply -f letsencrypt-staging-clusterissuer.yaml
  ```
* This is staging certificate; if you want to create prod certificate (fully trusted) use Let's Encrypt prod API: *https://acme-v02.api.letsencrypt.org/directory*
  * Instead of letsencrypt-staging-clusterissuer-example.yaml use *letsencrypt-prod-clusterissuer-example.yaml*

### istio

* See following file in istio directory for detailed setup instruction: [README.md](./istio/README.md)

### nodejs-colorizedapp

* Deploy nodejs-colorizedapp using helm chart
  * Create yaml file basing on [dev-env.yaml](../../helm/environments/dev-env.yaml), for example *my-dev-env.yaml*
    * If you need to create registry secret to access ACR from AKS you can use existing service principal (https://learn.microsoft.com/en-us/azure/container-registry/container-registry-authentication?tabs=azure-cli#service-principal) 
    * Or ACR admin account (WARNING, it's unsafe: https://learn.microsoft.com/en-us/azure/container-registry/container-registry-authentication?tabs=azure-cli#admin-account)
  * Run following command:
    ```
    helm upgrade --install nodejs-colorizedapp ./helm/nodejs-colorizedapp \
    --wait \
    --timeout 10m \
    --atomic \
    --namespace dev-env \
    --values ./helm/nodejs-colorizedapp/values.yaml \
    --values ./helm/environments/common.yaml \
    --values ./helm/environments/my-dev-env.yaml \
    --set deployments.d1.weight=50 \
    --set deployments.d2.weight=50
    ```
