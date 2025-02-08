## Project name
nodejs-colorizedapp - a simple application in nodejs to try Kubernetes, Kustomize, Istio, ArgoCD, Keycloak and Github Actions.

## Table of contents
- [Project name](#project-name)
- [Table of contents](#table-of-contents)
- [General info](#general-info)
- [Technologies](#technologies)
- [Setup](#setup)
  - [Development mode](#development-mode)
  - [Production Kubernetes](#production-kubernetes)
- [Usage](#usage)

## General info
The purpose of this app was to test the following technologies:
- Github Actions and compare it to Jenkins in relation to continuous integration/continuous delivery process
- Istio
- ArgoCD (and again - compare it to Jenkins) in relation to continuous delivery process
- Keycloak for testing SSO via Entra ID (formerly Azure AD)
- Kustomize as a lightweight replacement for Helm Charts

The application is very simple - it shows a main page that can be parametrised and it has livenes and readiness probes.
  
## Technologies
* Application: Node.js and Express
* Pipelines: Github Actions

Code was tested on following platforms:
* npm 10.9.2
* Node.js 22.13.1 (LTS)
* Kubernetes 1.30.6

Used libraries:
* available in package.json

## Setup

### Development mode

1. Clone git repo to localhost.
2. Install required packages.
    ```
    npm ci
    ```
3. To start application, perform:
    ```
    node src/app.js
    ```

After start, you can access app using following URL in your browser:
```
http://127.0.0.1:3000/
```

### Production Kubernetes

* For infra setup see following file [README.md](./infra/terraform/README.md) 
* For minimal setup for cluster components see following file [README.md](./infra/kubernetes/README.md)
  * Minmal setup requires cert-manager, ingress-nginx and istio
* If you want to create more complex setup with additional instances of Keycloak connected to Entra ID and ArgoCD, see following files:
  * Keycloak [README.md](./infra/kubernetes/keycloak/README.md)
  * ArgoCD [README.md](./infra/kubernetes/argocd/README.md)
  * WARNING: this setup requires trusted SSL certificates. Reffer to [README.md](./infra/kubernetes/README.md) for *clusterissuer-prod* example

## Usage

Application:
Index available at: http://127.0.0.1:3000/

Application can be parametrized via environment variables:
* *MESSAGE* (string): message that will be present on main page
* *BG_COLOR* (string): background color in main page defined in HEX format (#COLOR1)
* *FONT_COLOR* (string): text color in main page color defined in HEX format (#COLOR2)
* *FORCE_SET_NOT_READY* (bool): force app to never become healthy

Example:
```
MESSAGE="Custom Message" BG_COLOR="#ffcc00" FONT_COLOR="#990000" FORCE_SET_NOT_READY="false" node src/app.js
```
