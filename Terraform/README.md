# ecs-terraform

## Command when Manual run locally

1.terraform init

2.terraform workspace new dev

3.terraform plan  --var-file .\environments\dev.tfvars

4.terraform apply --var-file .\environments\dev.tfvars --auto-approve

TO destroy:

1.terraform destroy --var-file .\environments\dev.tfvars --auto-approve

Note:--auto-approve is used when u dont wnat to answer confirmation prompt

## Commands in pipeline

Configuration in pipeline

1.environment 
    {
        .
        .
        .
        
        INFRA_ENVIRONMENT = "dev"
        .
        .
        .
    }
    
    
 stage('initializing the terraform') 
        {
            steps 
            {
                sh '''
                    echo "**********************************$(date "+%m%d%Y %T") : Running terraform init**********************************"
                    
                    cd ecs-terraform
                    
                    cd Terraform
                    
                    ls -ltr
                    
                    terraform init
                    
                    terraform workspace select $INFRA_ENVIRONMENT || terraform workspace new $INFRA_ENVIRONMENT
                    
                    terraform plan -var-file ./environments/$INFRA_ENVIRONMENT.tfvars
                '''  
            }
        }
                stage("Approval Stage") {
            steps {
                script {
                    def userInput = input(id: 'Proceed1', message: 'Promote build?', parameters: [[$class: 'BooleanParameterDefinition', defaultValue: true, description: '', name: 'Please confirm you agree with this']])
                    
                    echo 'userInput: ' + userInput

                    if(userInput == true) {
                                sh '''
                                    cd ecs-terraform
                                    
                                    cd Terraform
                                    
                                    terraform apply --var-file ./environments/$INFRA_ENVIRONMENT.tfvars --auto-approve
                                '''             
                    } else {
                    
                        echo "Action was aborted."
                    }

                }    
            }  
        }


## Commands to SSH into ec2 isntance

1. "terraform output show jumpbox_public_ip" gives public ip of jumpbox
2. ssh-agent bash
3. ssh-add <complete path to ur pem file> (In this case since workstation.pem is used for both jumpbox and ECS instances, command will be ssh-add <path to workstation.pem>)
4. ssh -A ubuntu@<jumpbox_public_ip>  (username her is ubuntu as we selected ubuntu20.04 image for jumpbox vm)
  You will be logged into Jumpbox VM
  
  The following command inside Jumpbox VM
    
5. ssh ec2user@PrivateIP of ECS-ec2-instance  (Can be found by checking EC2 dashboard after clicking on ECS-EC2 instance you provisioned)
    
  You should be logged into ECS instance in private subnet!!!

        
 
