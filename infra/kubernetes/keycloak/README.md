## General info
Keycloak deployment via kustomize to be used as IAM solution to access ArgoCD using existing Entra ID directory.

## Requirements
* Existing Entra ID directory
* Rename file *configmap-realm-example.yaml* to *configmap-realm.yaml*
* Edit file *deployment-patch-example.yaml* and set correct hostname and very strong admin password. Rename it to *deployment-patch.yaml*
* Edit file *ingress.yaml*, update host, secret name and change cert manager issuer if required

## Installation
Generate manifest:
```
kubectl kustomize .
```
Install Keycloak:
```
kubectl apply -k .
```

## Setup

TODO!
- 1st link: https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/keycloak/
- 2nd link: https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/microsoft/
- 3rd link: https://rahulroyz.medium.com/using-keycloak-as-idp-for-azure-ad-role-authorization-part-2-map-ad-groups-to-keycloak-roles-9850d4acd536
- 4th link: https://keycloak.discourse.group/t/groups-from-azure-ad/4876/1
  - Mapper: Advaced Claim to Group mapper (Identity Providers -> Provider)
  - Before login: delete existing users in Keycloak to ensure refresh of groups that users belongs to.

## Ensure configuration as a code

When your setup is completed, export you realm to file (default name: *realm-export.json*).
Then use following commands to generate new configmap that will store your realm configuration.
```
kubectl delete configmap -n keycloak configmap-realm
kubectl create configmap configmap-realm.yaml --from-file=realm-export.json --dry-run=client -o yaml > configmap-realm.yaml
```
Redeploy application using commands from Installation section.
