## General info

Terraform configuration to create nodejs-colorizedapp stack

## Requirements

* Existing resource group:
```
az group create --name nodejscolorizedapp-rg --location centralindia
```
* vars file created
```
touch infra.auto.tfvars
```
with following content:
```
$ cat nodejscolorizedapp.auto.tfvars
existing_rg           = "nodejscolorizedapp-rg"
provision_acr         = "true"
acr_name              = "myacrind01"
acr_custom_region     = "centralindia"
aks_name              = "myaksind01"
aks_custom_region     = "centralindia"
provision_aks         = "true"
aks_resources_rg_name = "nodejscolorizedapp-rg-myaksind01"
aks_node_sku          = "Standard_B4as_v2"
```
* if you want to adjust more parameters, take a look at [main.tf](./main.tf) and [variables.tf](https://github.com/mrachuta/terraform-resources/blob/master/modules/azure-aks-cheap-cluster-module/variables.tf)
* module by default is integrating AKS with ACR by granting AcrPull role to AKS Managed Identity

## Usage

Create resources:
```
terraform apply
```
Destroy resources:
```
terraform destroy
```
