# network.tf

resource "aws_vpc" "mappedswap-vpc" {
  cidr_block = "172.16.0.0/16"

  tags = {
    Name = "mappedswap-vpc"
  }
}

# Fetch AZs in the current region
data "aws_availability_zones" "available" {
}


# Create var.az_count private RDS subnets, each in a different AZ
resource "aws_subnet" "privateRDS" {
  count             = var.az_count
  cidr_block        = cidrsubnet(aws_vpc.mappedswap-vpc.cidr_block, 8, var.az_count + count.index + 2)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  vpc_id            = aws_vpc.mappedswap-vpc.id
  tags = {
    Name = "private_RDS"
  }
}

# Create var.az_count private subnets, each in a different AZ
resource "aws_subnet" "private" {
  count             = var.az_count
  cidr_block        = cidrsubnet(aws_vpc.mappedswap-vpc.cidr_block, 8, var.az_count + count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  vpc_id            = aws_vpc.mappedswap-vpc.id
  tags = {
    Name = "private_subnets"
  }
}

# Create var.az_count public subnets, each in a different AZ
resource "aws_subnet" "public" {
  count                   = var.az_count
  cidr_block              = cidrsubnet(aws_vpc.mappedswap-vpc.cidr_block, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  vpc_id                  = aws_vpc.mappedswap-vpc.id
  map_public_ip_on_launch = true

  tags = {
    Name = "public_subnets"
  }
}

# Internet Gateway for the public subnet
resource "aws_internet_gateway" "mappedswap-igw" {
  vpc_id = aws_vpc.mappedswap-vpc.id
  
  tags = {
    Name = "mappedswap-igw"
  }
}

# Route the public subnet traffic through the IGW
resource "aws_route" "internet_access" {
  //name                   = "main_routetable"
  route_table_id         = aws_vpc.mappedswap-vpc.main_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.mappedswap-igw.id
  
}

# Create a NAT gateway with an Elastic IP for each private subnet to get internet connectivity
resource "aws_eip" "mappedswap-eip" {
  count      = var.az_count
  vpc        = true
  depends_on = [aws_internet_gateway.mappedswap-igw]
}

resource "aws_nat_gateway" "mappedswap-natgw" {
  count         = var.az_count
  subnet_id     = element(aws_subnet.public.*.id, count.index)
  allocation_id = element(aws_eip.mappedswap-eip.*.id, count.index)
  tags = {
    Name = "mappedswap-natgw"
  }
}

# Create a new route table for the private subnets, make it route non-local traffic through the NAT gateway to the internet
resource "aws_route_table" "private" {
  count  = var.az_count
  vpc_id = aws_vpc.mappedswap-vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = element(aws_nat_gateway.mappedswap-natgw.*.id, count.index)
  }
  tags = {
    Name = "private_routetable"
  }
  
}

resource "aws_route_table" "RDSprivate" {
  count  = var.az_count
  vpc_id = aws_vpc.mappedswap-vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = element(aws_nat_gateway.mappedswap-natgw.*.id, count.index)
  }

  tags = {
    Name = "RDS_routetable"
  }
  
}

# Explicitly associate the newly created route tables to the private subnets (so they don't default to the main route table)
resource "aws_route_table_association" "private" {
  count          = var.az_count
  subnet_id      = element(aws_subnet.private.*.id, count.index)
  route_table_id = element(aws_route_table.private.*.id, count.index)
}


# Explicitly associate the newly created RDS route tables to the RDS private subnets (so they don't default to the main route table)
resource "aws_route_table_association" "RDSprivate" {
  count          = var.az_count
  subnet_id      = element(aws_subnet.privateRDS.*.id, count.index)
  route_table_id = element(aws_route_table.RDSprivate.*.id, count.index)
}
