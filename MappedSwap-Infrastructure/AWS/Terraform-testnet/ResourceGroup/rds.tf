# resource "aws_db_instance" "postgres" {
#   allocated_storage         = 10
#   engine                    = "postgres"
#   engine_version            = "12"
#   instance_class            = "db.t3.micro"
#   name                      = "postgres"
#   username                  = "postgres"
#   password                  = "pwForPOS123"
#   port                      = "5432"
#   vpc_security_group_ids    = [aws_security_group.ecs_sg.id]
#   db_subnet_group_name      = aws_db_subnet_group.db-subnet.name
#   skip_final_snapshot       = true
# }