# CDK Deployment stack for LTL Survey Audit application

This project handles the CDK creation of backend resources and frontend deployments of the Admin and Survey React applications.

To use, build environment specific versions of the surveyclient and adminclient React applications, then run the relevant CDK commands below.

## Useful commands

- `cdk deploy [options]` deploy this stack to your default AWS account/region
- `cdk diff [options]` compare deployed stack with current state
- `cdk synth [options]` emits the synthesized CloudFormation template

## Command options

- `--profile PROFILENAME` (optional) deploy to the named AWS profile
- `--context env=ENVIRONMENT_NAME` (required) build the named environment (`dev`, `test`, `live`, etc)
