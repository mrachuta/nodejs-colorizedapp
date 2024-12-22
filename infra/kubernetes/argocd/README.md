## General info
ArgoCD deployment via kustomize to be used with CD process for nodejs-colorizedapp.
Configuration is dedicated to support Keycloak + Entra ID as IAM solution.

## Requirements
* Existing & configured Keycloak instance to be used with Entra ID
* Edit file *secret-argocd-secret-patch-example.yaml* and replace secret with valid value from Keycloak client configuration. Rename it to *secret-argocd-secret-patch.yaml*
* Edit file *configmap-argocd-cm-patch-example.yaml* and set correct issuer, client and url. Rename it to *configmap-argocd-cm-patch.yaml*
* Edit file *ingress.yaml*, update host, secret name and change cert manager issuer if required

## Installation
Generate manifest:
```
kubectl kustomize .
```
Install ArgoCD:
```
kubectl apply -k .
```

## Initial admin password
```
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

## App deployment config
It's suitable for most popular k8s setup.

```
project: default
source:
  repoURL: 'https://github.com/mrachuta/nodejs-colorizedapp.git'
  path: helm/nodejs-colorizedapp
  targetRevision: master
  helm:
    valueFiles:
      - ../environments/dev-env.yaml
destination:
  server: 'https://kubernetes.default.svc'
  namespace: dev-env
syncPolicy:
  automated: {}
```