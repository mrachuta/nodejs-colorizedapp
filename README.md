## Project name
nodejs-colorizedapp - simple application in nodejs to try k8s, istio, argoCD and Github Actions.

## Table of contents
- [Project name](#project-name)
- [Table of contents](#table-of-contents)
- [General info](#general-info)
- [Technologies](#technologies)
- [Setup](#setup)
  - [Development mode](#development-mode)
  - [PROD Kubernetes](#prod-kubernetes)
- [Usage](#usage)

## General info
Purpose of this app was to test following things:
- Github Actions (and compare it with Jenkins) in relation to Continious Integration/Continous Delivery process
- Istio
- ArgoCD (and again - compare it with Jenkins) in relation to Contionious Delivery process (not finished yet!)

The application is very simple - it shows main page that can be parametrized, has livenes and readiness probes.
  
## Technologies
* Application: Node.js and Express
* Pipelines: Github Actions

Code was tested on following platforms:
* npm 10.4.0
* Node.js 20.10
* Kubernetes v1.27.9 (containerd 1.7.15-1)

Used libraries:
* available in package.json

## Setup

### Development mode

1. Clone git repo to localhost.
2. Install required packages.
   ```
    npm init -y
    npm install express
    ```
3. To start application, perform:
    ```
    node src/app.js
    ```
After start, you can access app using following URL in your browser:
```
http://127.0.0.1:3000/
```

### PROD Kubernetes

* For infra setup see following file [README.md](./infra/terraform/README.md)  
* For kubernetes cluster components and helm deployment see following file [README.md](./infra/kubernetes/README.md)

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
