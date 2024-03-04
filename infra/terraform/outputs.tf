output "rg_id" {
  value = module.aks_cheap_cluster.rg_id
}

output "acr_address" {
  value = module.aks_cheap_cluster.acr_address
}

output "aks_cluster_name" {
  value = module.aks_cheap_cluster.aks_cluster_name
}

output "aks_loadbalancer_ip" {
  value = module.aks_cheap_cluster.aks_loadbalancer_ip
}
