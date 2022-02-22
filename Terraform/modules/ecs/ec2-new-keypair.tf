/*resource "tls_private_key" "ec2-keypair-ecs-cluster" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_file" "ec2-keypair-ecs-cluster-private_key_pem" {
  filename = "${path.module}/ec2-keypair-ecs-cluster-private_key.pem"
  content  = tls_private_key.ec2-keypair-ecs-cluster.private_key_pem
}
module "key_pair" {
  source = "terraform-aws-modules/key-pair/aws"

  key_name   = "${var.cluster_name}-${terraform.workspace}-ec2-keypair"
  public_key = tls_private_key.ec2-keypair-ecs-cluster.public_key_openssh
}*/
