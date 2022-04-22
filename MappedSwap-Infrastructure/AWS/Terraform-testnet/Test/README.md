# <strong>Terraform Code Test</strong>

## <strong>Overview</strong>

Testing our Terraform code we will be using ["Terratest"](https://github.com/gruntwork-io/terratest). Terratest is a Go library that makes it easier to write automated tests for your infrastructure code. It provides a
variety of helper functions and patterns for common infrastructure testing tasks, including:

- Testing Terraform code
- Testing Packer templates
- Testing Docker images
- Executing commands on servers over SSH
- Working with AWS APIs
- Working with Azure APIs
- Working with GCP APIs
- Working with Kubernetes APIs
- Testing Helm Charts
- Making HTTP requests
- Running shell commands
- And much more

Please see the following for more info:

* [Terratest Website](https://terratest.gruntwork.io)
* [Getting started with Terratest](https://terratest.gruntwork.io/docs/getting-started/quick-start/)
* [Terratest Documentation](https://terratest.gruntwork.io/docs/)
* [Contributing to Terratest](https://terratest.gruntwork.io/docs/community/contributing/)
* [Commercial Support](https://terratest.gruntwork.io/commercial-support/)

## <strong>How to Run Test</strong>

### Requirements:
Go (requires version >=1.13)

1. To run the test you will need to be in the Test directory. 
```Terminal
# From the parent directory MappedSwap-Infrastructure
$ cd AWS/Terraform-PROD/Test
```
2. Check if GO is installed (Required)
```Terminal
# Since this is using GO, it is required you have GO installed
# To check for GO installed run:

$ go version

# Your output should look something like:
# go version go1.17.6
```

3. Initialize GO
```Terminal
$ go mod init test

# This will create a file called go.mod
```

4. Install Terratest
```Terminal
$ go get github.com/gruntwork-io/terratest/modules/terraform

# This will create a file called go.sum
```

5. Run Test
```Terminal
$ go test -v

# This will run your test in verbose mode
```

You should have been able to run your test successfully. Once the test is completed and passed you should see out put similar to:
```
TestTerraformResourceGroup 2022-01-26T12:32:37-08:00 logger.go:66: Destroy complete! Resources: 25 destroyed.
TestTerraformResourceGroup 2022-01-26T12:32:37-08:00 logger.go:66:
--- PASS: TestTerraformResourceGroup (232.03s)
PASS
ok      test    232.061s
```