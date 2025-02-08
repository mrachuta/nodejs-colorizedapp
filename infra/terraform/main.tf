module "aks_cheap_cluster" {
  source = "github.com/mrachuta/terraform-resources.git//modules/azure-aks-cheap-cluster-module?ref=v1.4.1"

  existing_rg                   = var.existing_rg
  provision_acr                 = var.provision_acr
  acr_custom_region             = var.acr_custom_region
  provision_aks                 = var.provision_aks
  aks_custom_region             = var.aks_custom_region
  acr_name                      = var.acr_name
  acr_grant_pull_role_to_aks    = true
  aks_name                      = var.aks_name
  aks_resources_rg_name         = var.aks_resources_rg_name
  aks_lb_sku                    = "basic"
  aks_node_count                = var.aks_node_count
  aks_node_sku                  = var.aks_node_sku
  az_cli_path                   = var.az_cli_path
  provisioner_arm_client_secret = var.provisioner_arm_client_secret
  nginx_ingress_additional_params = {
    "controller.service.externalTrafficPolicy"                                  = "Local"
    "controller.annotations.traffic\\.sidecar\\.istio\\.io/includeInboundPorts" = ""
  }
  aks_scaling_details_default_node = {
    days          = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    start_time_HH = 10
    start_time_MM = 00
    stop_time_HH  = 22
    stop_time_MM  = 30
    timezone      = "UTC"
  }
}
