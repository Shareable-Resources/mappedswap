#in this template we are creating aws application laadbalancer and target group and alb http listener

resource "aws_alb" "alb" {
  name           = "myapp-load-balancer"
  subnets        = aws_subnet.public.*.id
  security_groups = [aws_security_group.alb-sg.id]
}

#create a target group for dApp
resource "aws_alb_target_group" "mappedswap-dApp-tg" {
  name        = "mappedswap-dApp-tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.mappedswap-vpc.id

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    protocol            = "HTTP"
    matcher             = "200"
    path                = var.health_check_path
    interval            = 30
  }
}

#create the target group for agent
resource "aws_alb_target_group" "mappedswap-agent-tg" {
  name        = "mappedswap-agent-tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.mappedswap-vpc.id

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    protocol            = "HTTP"
    matcher             = "200"
    path                = var.health_check_path
    interval            = 30
  }
}

#redirecting all incomming traffic from ALB to the target group
resource "aws_alb_listener" "app" {
  load_balancer_arn = aws_alb.alb.id
  port              = var.app_port
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = "arn:aws:acm:ap-northeast-1:902130451614:certificate/efd6318f-3e94-4dc2-8da3-5cb9d09eb35a"
  #enable above 2 if you are using HTTPS listner and change protocal from HTTP to HTTPS
  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.mappedswap-dApp-tg.arn
  }
}
