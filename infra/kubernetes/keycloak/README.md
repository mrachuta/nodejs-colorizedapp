## General info
A Keycloak deployment via kustomize to be used as IAM solution to access ArgoCD using existing Entra ID directory.

## Requirements
* Existing Entra ID directory
* Rename file *configmap-realm-example.yaml* to *configmap-realm.yaml*
* Edit file *deployment-patch-example.yaml* and set correct hostname and very strong admin password. Rename it to *deployment-patch.yaml*
* Edit file *ingress.yaml*, update host, secret name and change cert manager issuer if required

## Installation
Create namespace:
```
kubectl get ns keycloak || kubectl create ns keycloak
```
Generate manifest:
```
kubectl kustomize .
```
Install Keycloak:
```
kubectl apply -k .
```

## Setup

### Configure Entra ID and OIDC

1. Follow steps mentioned on this page: https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/microsoft/#configure-a-new-entra-id-app-registration with small remarks:
   - Your redirect URI should be: *https://<YOUR_KEYCLOAK_ADDRESS>/realms/<YOUR_REALM_NAME>/broker/entra/endpoint*
    - It's good here to decide what realm name you will use in Keycloak. Otherwise you need to back here in future and update it.
      - You can name it for example "entra"
   - Mobile platform Redirect UI is not required.
   - Select from left menu *Overview*, copy value *Application (client) ID* and note it somewhere. It will be required later.
2. Generate secret to be used in future in Keycloak according to this page: https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/microsoft/#add-credentials-a-new-entra-id-app-registration
   - Note secret. It will be required later.
3. Go to *API Permissions* menu and click *Add a permission*
   - Select *Microsoft Graph*
   - Select *Delegated Permissions* -> *User* -> *User.Read* and click *Add permissions*
4. Go to *Token configuration* and clik *Add groups claim*
   - Select *Security Groups* and in each of three categories select *Group ID*
5. Go to *Manifest* and select *Microsoft Graph App Manifest (New)*
   - Ensure that key *groupMembershipClaims *has value *SecurityGroup*. If not, change it to *SecurityGroup*
6. Add new group on Entra ID. Go to main screen of Entra and select *Groups* -> *New group*
   - Name of group: *argocd-admins*
   - Type: *Security group*
   - Add yourself as a member and as a owner
   - Note somewhere please *Object ID* for group. It will be required later.
7. Get your *Tenant ID* and note it somewhere.
   - You can find it on the main screen of Entra module in Microsoft Azure

### Configure Keycloak

1. Create new realm with the same name as in point no. 1 in previous block
2. Go to *Manage* -> *Clients* and click *Create client*:
   - For every parameter that is not mentioned here - leave it as default value
   - Client type: *OpenID Connect*
   - Client ID: *argocd*
   - Name: *ArgcoCD Client*
   - Click *Next*
   - Authentication flow: select *Standard flow* and *Direct access grants*
   - Click *Next*
   - Root URL: *https://<YOUR_ARGOCD_ADDRESS>*
   - Home URL: */applications*
   - Valid redirect URIs: *https://<YOUR_ARGOCD_ADDRESS>/auth/callback*
   - Valid post logout redirect URIs: *https://<YOUR_ARGOCD_ADDRESS>/applications*
   - Web origins: *https://<YOUR_ARGOCD_ADDRESS>*
   - Click *Save*
3. Setup client scope. Go to *Client scopes* and click *Create client scope*:
   - Name: *groups*
   - Type: *Default*
   - Protocol: *OpenID Connect*
   - Display on consent screen: *On*
   - Include in token scope: *On*
   - Click *Save*
4. Go to recently created client scope *groups*. Go to *Mappers* tab and click *Configure new mapper*
   - Select *Group Membership*
   - Ensure following parameters
     - Name: *groups-mapper*
     - Token claim name: *groups*
     - Full group path: *Off*
     - Add to ID token: *On*
     - Add to access token: *On*
     - Add to lightweight access token: *On*
     - Add to userinfo: *On*
     - Add to token introspection: *On*
5.  Return to Clients. Select recently created client *argocd* and move to *Client scopes* tab. 
     - Click *Add client scope* and select recently created scope *groups*. Add it to default scope.
6.  Go to *Groups*. Create new group.
    - Name: *argocd-admins*
    1. Go to *Identity providers* and click *Add provider*
    - Select *OpenID Connect*
    - Alias: *entra*
    - Display name: *Microsoft Entra*
    - Discovery endpoint: *https://login.microsoftonline.com/<YOUR_TENANT_ID>/v2.0/.well-known/openid-configuration*
    - Client authentication: *Client secret sent as post*
    - Client ID: *<YOUR_APPLICATION_CLIENT_ID>*
    - Client Secret: *<YOUR_SECRET>*
    - Click *Add*
7. Go to newly created provider *entra* and select tab *Mappers*. Click *Add mapper*
   - Name: *entra-group-to-argocd-admins-mapper*
   - Sync mode override: *Force*
   - Mapper type: *Advanced Claim to Group*
   - Claims:
     - Key: *groups*
     - Value: *<YOUR_GROUP_ID>*
   - Group: *argocd-admins*
   - Click *Save*

Important: in case of issues, delete your user from users list in Keycloak and login again to ArgoCD.

### Useful links

- https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/microsoft/
- https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/keycloak/
- https://rahulroyz.medium.com/using-keycloak-as-idp-for-azure-ad-role-authorization-part-2-map-ad-groups-to-keycloak-roles-9850d4acd536
- https://keycloak.discourse.group/t/groups-from-azure-ad/4876/1

## Realm configuration as a code

When your setup is completed, export you realm to file (default name: *realm-export.json*).
Then use following commands to generate new configmap that will store your realm configuration.
```
kubectl delete configmap -n keycloak configmap-realm
kubectl create configmap configmap-realm.yaml --from-file=realm-export.json --dry-run=client -o yaml > configmap-realm.yaml
```
Redeploy application using commands from Installation section.
