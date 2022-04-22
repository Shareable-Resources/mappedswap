# <b>MappedSwap AWS Infrastructure</b>
* TestNet environment with Terraform cloud, please go to the TestNet part.  

* MainNet environment with Terraform cloud, please go to the MainNet part.

* Local testing without Terraform cloud, please go to the local testing part. 

* To access the Terraform cloud, please go to the workspace in [Terraform Cloud](https://cloud.hashicorp.com/products/terraform).

* To know more about the Terraform scripts, please go to the Terraform parts.  

    

# <b>Table of contents</b>
1. [Overview](#overview)
2. [TestNet with Terraform Cloud](#TestNetwithTerraformcloud)
3. [MainNet with Terraform Cloud](#MainNetwithTerraformcloud)
4. [Local Testing without Terraform Cloud](#LocalTesting)
5. [How to use Terraform Cloud](#Terraformcloud)


# <b> Overview</b> <a name="overview"></a>
     .  
     ├── VPC    
     │   ├── subnet
     │   ├── security group
     │   ├── route table
     │   └── gateway
     │     
     └── Servers
         ├── load balancer
         ├── ecs
         ├── rds
         └── s3 bucket
# <b>TestNet with Terraform Cloud</b> <a name="TestNetwithTerraformcloud"></a>
...
# <b>MainNet with Terraform Cloud </b> <a name="MainNetwithTerraformcloud"></a>
...
# <b>Local Testing without Terraform Cloud</b>
<a name="LocalTesting"></a>
## Commands to execute terraform scripts:  

```terraform init```

The terraform init command is used to initialize a working directory containing Terraform configuration files.

```terraform plan```

The terraform plan command creates an execution plan, which lets you preview the changes that Terraform plans to make to your infrastructure.

```terraform apply```

The terraform apply command executes the actions proposed in a Terraform plan.

```terraform destroy```

The terraform destroy command is a convenient way to destroy all remote objects managed by a particular Terraform configuration.  

Note: When destroy failed, check and revoke the changes you made after the **terraform.tfstate** file is generated. 

## Services  
The infrastructure consists of several main modules, including *vpc, security group, load balancer, ecs, etc.*  
The amount of availability zone(az) is 2 and each az-related modules will be accordingly created in each az.
- ### [VPC](https://github.com/Mapped-Swap/MappedSwap-Infrastructure/blob/main/AWS/Terraform-DEV/ResourceGroup/vpc.tf)
        "mappedswap-vpc"
            ├── subnet
            │     ├── public subnet     - ["public_subnets"]
            │     └── private subnet    - ["private_subnets", "private_RDS"]
            │       
            ├── routetable              - [internet_access, "private_routetable", "RDS_routetable"] 
            ├── routetable association: - [private, RDSprivate]          
            ├── internet gateway:       - ["mappedswap-igw"]
            └── NAT gateway:            - ["mappedswap-natgw"]
                   └── elastic IP:      - [mappedswap-eip]  


        Note: With double quotes are the exact name of them defined in tag block.
- ### [Security group](https://github.com/Mapped-Swap/MappedSwap-Infrastructure/blob/main/AWS/Terraform-DEV/ResourceGroup/security-groups.tf)
  - "app-load-balancer-security-group"
  - "app-ecs-tasks-security-group"
  - "app-rds-security-group"
  - "app-jump-security-group"
- ### [Load balancer](https://github.com/Mapped-Swap/MappedSwap-Infrastructure/blob/main/AWS/Terraform-DEV/ResourceGroup/alb.tf)
    In this project we are creating aws application load balancer and target group and alb http listener.  

    > load balancer: "myapp-load-balancer"
    > target group: "mappedswap-dApp-tg", "mappedswap-agent-tg"
- ### [ECS](https://github.com/Mapped-Swap/MappedSwap-Infrastructure/blob/main/AWS/Terraform-DEV/ResourceGroup/ecs.tf)
    
# <b>Terraform Cloud</b>
<a name="Terraformcloud"></a>
...




