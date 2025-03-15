## General info

Terraform configuration to create nodejs-colorizedapp stack

## Requirements

* Registered providers:
  ```
  az provider register --namespace Microsoft.Storage
  az provider register --namespace Microsoft.ContainerService
  az provider register --namespace Microsoft.Kubernetes
  az provider register --namespace Microsoft.ContainerRegistry
  az provider register --namespace Microsoft.ManagedIdentity
  az provider register --namespace Microsoft.App
  az provider register --namespace Microsft.Insights
  ```
* Existing resource group:
  ```
  az group create --name nodejscolorizedapp-rg --location centralindia
  ```
* Storage account with container created:
  ```
  az storage account create --resource-group nodejscolorizedapp-rg --name sa01 --sku Standard_LRS --encryption-services blob
  az storage container create --name terraform-remote-state --account-name sa01
  ```
* terraform.tf file updated:
  ``` 
  resource_group_name
  storage_account_name
  ```
* vars file created
  ```
  touch nodejscolorizedapp.auto.tfvars
  ```
  with following content:
  ```
  $ cat nodejscolorizedapp.auto.tfvars
  existing_rg           = "nodejscolorizedapp-rg"
  provision_acr         = true
  acr_name              = "myacrind01"
  acr_custom_region     = "centralindia"
  provision_aks         = true
  aks_name              = "myaksind01"
  aks_custom_region     = "centralindia"
  aks_resources_rg_name = "nodejscolorizedapp-rg-myaksind01"
  aks_node_count        = "2"
  aks_node_sku          = "Standard_B4as_v2"
  contapp_env_name      = "nodejscolorizedapp-contapp01"
  az_cli_path           = "/path/to/az/cli/executable"
  ```
* if you want to adjust more parameters, take a look at [main.tf](./main.tf) and [variables.tf](https://github.com/mrachuta/terraform-resources/blob/master/modules/azure-aks-cheap-cluster-module/variables.tf)
* module by default is integrating AKS with ACR by granting AcrPull role to AKS Managed Identity

## Usage

Initalize terraform:
```
terraform init
```
Create resources:
```
terraform apply
```
Destroy resources:
```
terraform destroy
```
