resource "aws_ecs_cluster" "mappedswap-dApp-backend-cluster" {
  name = "mappedswap-dAPP-backend"
}

resource "aws_ecs_cluster" "mappedswap-agent-backend-cluster" {
  name = "mappedswap-agent-backend"
}

resource "aws_ecs_cluster" "mappedswap-cronjob-backend-cluster" {
  name = "mappedswap-cronjob-backend"
}

resource "aws_ecs_cluster" "mappedswap-onlinedatafetcher-backend-cluster" {
  name = "mappedswap-onlinedatafetcher-backend"
}

resource "aws_ecs_cluster" "mappedswap-miningrewards-backend-cluster" {
  name = "mappedswap-miningrewards-backend"
}

# data "template_file" "app" {
#   template = file("./templates/image/image.json")
# 
#   vars = {
#     app_image      = var.app_image
#     app_port       = var.app_port
#     fargate_cpu    = var.fargate_cpu
#     fargate_memory = var.fargate_memory
#     aws_region     = var.aws_region
#   }
# }

# resource "aws_ecs_task_definition" "mappedswap-def" {
#   family                   = "app-task"
#   execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
#   network_mode             = "awsvpc"
#   requires_compatibilities = ["FARGATE"]
#   cpu                      = var.fargate_cpu
#   memory                   = var.fargate_memory
#   container_definitions    = templatefile("./templates/image/image.json", {
#     app_image      = var.app_image
#     app_port       = var.app_port
#     fargate_cpu    = var.fargate_cpu
#     fargate_memory = var.fargate_memory
#     aws_region     = var.aws_region
#   })
# }

# resource "aws_ecs_service" "test-service" {
#   name            = "app-service"
#   cluster         = aws_ecs_cluster.mappedswap-cluster.id
#   task_definition = aws_ecs_task_definition.mappedswap-def.arn
#   desired_count   = var.app_count
#   launch_type     = "FARGATE"

#   network_configuration {
#     security_groups  = [aws_security_group.ecs_sg.id]
#     subnets          = aws_subnet.private.*.id
#     assign_public_ip = true
#   }

#   load_balancer {
#     target_group_arn = aws_alb_target_group.mappedswap-dApp-tg.arn
#     container_name   = "app"
#     container_port   = var.app_port
#   }

#   depends_on = [aws_alb_listener.app, aws_iam_role_policy_attachment.ecs_task_execution_role]
# }
