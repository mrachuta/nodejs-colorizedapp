# We strongly recommend using the required_providers block to set the
# Azure Provider source and version being used
terraform {
  required_version = ">= 1.3"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">=4.20.0"
    }
  }
  backend "azurerm" {
    resource_group_name  = "mzra-rg01"
    storage_account_name = "mzrasa01"
    container_name       = "terraform-remote-state"
    key                  = "terraform.tfstate"
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  resource_provider_registrations = "none"
  features {}
}

provider "null" {
}
