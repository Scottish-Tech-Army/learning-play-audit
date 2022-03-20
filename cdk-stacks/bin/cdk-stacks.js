#!/usr/bin/env node

const cdk = require("aws-cdk-lib");
const { CdkBackendStack } = require("../lib/cdk-backend-stack");
const { CdkFrontendStack } = require("../lib/cdk-frontend-stack");

const app = new cdk.App();
const envStageName = app.node.tryGetContext("env");
const resourcePrefixName = app.node.tryGetContext("nameprefix");
const surveyEmailBcc = app.node.tryGetContext("surveyEmailBcc");
const surveyEmailFrom = app.node.tryGetContext("surveyEmailFrom");

if (
  !envStageName ||
  !resourcePrefixName ||
  !surveyEmailBcc ||
  !surveyEmailFrom
) {
  throw new Error(
    `run with parameters:
  --context nameprefix=AWS_RESOURCE_NAME_PREFIX
  --context surveyEmailBcc=EMAIL_ADDRESS
  --context surveyEmailFrom=EMAIL_ADDRESS
  --context env=ENVIRONMENT_NAME (i.e. dev, test, live, etc.)`
  );
}

const backendStack = new CdkBackendStack(
  app,
  resourcePrefixName + "-Backend-" + envStageName,
  {
    environment: envStageName,
    surveyEmailBcc: surveyEmailBcc,
    surveyEmailFrom: surveyEmailFrom,
    resourcePrefix: resourcePrefixName + "-" + envStageName,
  }
);

const frontendStack = new CdkFrontendStack(
  app,
  resourcePrefixName + "-Frontend-" + envStageName,
  {}
);

cdk.Tags.of(backendStack).add("DeployEnvironment", envStageName);
cdk.Tags.of(frontendStack).add("DeployEnvironment", envStageName);
