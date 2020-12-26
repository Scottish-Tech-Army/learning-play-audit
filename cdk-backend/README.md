# CDK Deployment stack for LTL Survey Audit application

This project handles the CDK creation of backend resources and frontend deployments of the Admin and Survey React applications.

## Prerequisites

- Register or use an existing AWS account
- Install the [AWS CDK](https://docs.aws.amazon.com/cdk/index.html), described here: https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_install

## Useful commands

- `cdk deploy [options]` deploy this stack to your default AWS account/region
- `cdk diff [options]` compare deployed stack with current state
- `cdk synth [options]` emits the synthesized CloudFormation template

## Command options

- `--profile PROFILENAME` (optional) deploy to the named AWS profile
- `--context env=ENVIRONMENT_NAME` (required) build the named environment (`dev`, `test`, `live`, etc)

## AWS Deployment architecture

The LTL Survey consists of:

- Backend
  - A DominoDB table of survey responses. Each item contains some indexing fields, the survey response in JSON format, and keys to photos submitted as part of the survey response
  - An S3 bucket containing the uploaded photos undexed above. The objects have keys `/surveys/[SURVEY UUID]/photos/[PHOTO UUID]`
  - Lambda functions for the survey client to [add](resources/addSurveyLambda) and [confirm](resources/confirmSurveyLambda) survey upload.
  - API Gateway wrapper for these lambda functions.
  - Cognito user pools for survey users and survey admin users. Separate pools to allow for greater admin user security.
  - Cognito identity pool to assign role to survey admin user pool, allowing read access to the DynamoDB table and the S3 bucket.
- Frontend
  - S3 buckets for the survey and admin web interfaces
  - CloudFront distributions for each of the web interfaces S3 buckets

The DynamoDB table, the photos S3 bucket and the two user pools are set to retain on delete, with fixed resource names to avoid a CloudFormation update replacing them (as their contents are not easily replaced).

## Building and deploying

The web clients are held in [adminclient](../adminclient) and [surveyclient](../surveyclient). Note that the cdk project will need to be deployed at least once to obtain the correct environment property values used by the web clients for each deployment environment. To build and deploy for a particular environment for the first time:

1. create a production build of the [sharedmodel](../sharedmodel) (`npm install; npm run build`)
1. create production builds of the two web clients (`npm install; npm run build`)
1. run `cdk deploy` to the correct environment (as described in the command options above)
1. use the deploy output values to create an environment specific version of the web clients (by populating `.env.[ENVIRONMENT]` files in the web client directories)
1. recreate production builds of the web clients (`npm run build`)
1. finally repeat `cdk deploy` to deploy the web clients correctly wired to the backend.

Subsequent builds only require steps 5 and 6 (but remember to rebuild the clients prior to cdk deploying to a different environment to avoid deploying clients connected to the wrong backend).
