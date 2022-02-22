#Create new key pair
/*resource "tls_private_key" "jumpbox-keypair" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_file" "jumpbox-private_key_pem" {
  filename = "${path.module}/jumpbox-private_key.pem"
  content  = tls_private_key.jumpbox-keypair.private_key_pem
}
module "jumpbox-key_pair" {
  source = "terraform-aws-modules/key-pair/aws"

  key_name   = "${var.cluster_name}-${terraform.workspace}-jumpbox-keypair"
  public_key = tls_private_key.jumpbox-keypair.public_key_openssh
}*/