module "ecs-cluster" {
  source = "./modules/ecs"

  cluster_name = var.cluster_name
  aws_region = var.aws_region
  create_vpc = var.create_vpc
  vpc_id = var.vpc_id
  cluster_subnet_ids = var.cluster_subnet_ids
  jumpbox_subnet_id = var.jumpbox_subnet_id
  alb_security_group = module.alb.alb_security_group
  key_name = var.key_name
}

module "alb" {
  source = "./modules/alb"
  
  cluster_name = var.cluster_name
  aws_region = var.aws_region
  vpc_id = var.vpc_id
  subnet_ids = var.alb_subnet_ids
  allowed_cidr_blocks = ["0.0.0.0/0"]
}