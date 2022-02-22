resource "aws_instance" "jumpbox" {
  ami                         = data.aws_ami.jumpbox_image_id.id
  instance_type               = "t2.medium"
  vpc_security_group_ids      = [aws_security_group.jumpbox.id]
  subnet_id                   = var.jumpbox_subnet_id
  associate_public_ip_address = true
  key_name                    = data.aws_key_pair.jumpbox_instance_key_name.key_name
  tags = {
    Name = "jumpbox-${var.cluster_name}-${terraform.workspace}"
  }
}

resource "aws_security_group" "jumpbox" {
  name        = "jumpbox-${var.cluster_name}-${terraform.workspace}-sg"
  description = "Allow traffic over port 22"
  vpc_id      = data.aws_vpc.main.id

  ingress {

    description = "Allow-http from public"
    from_port   = 0
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [
    "0.0.0.0/0"]

  }

  egress {

    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = [
    "0.0.0.0/0"]

  }

  tags = {
    Name = "allow_ssh_access"
  }
}

output "jumpbox_ip" {
  value = aws_instance.jumpbox.public_ip
}