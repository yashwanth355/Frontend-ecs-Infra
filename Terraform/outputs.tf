/*output "ec2-keypair-private-key" {
  value = module.ecs-cluster.ec2-keypair-private-key
  sensitive   = true
}

output "jumpbox-keypair-private-key" {
  value = module.ecs-cluster.jumpbox-keypair-private-key
  sensitive   = true
}*/

output "jumpbox_public_ip" {
  value = module.ecs-cluster.jumpbox_ip
}

