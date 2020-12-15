#!/usr/bin/env node

const cdk = require("@aws-cdk/core");
const { CdkBackendStack } = require("../lib/cdk-backend-stack");

const app = new cdk.App();
const envStageName = app.node.tryGetContext("env");

if (!envStageName) {
  throw new Error(
    "run with parameter --context env=ENVIRONMENT_NAME (i.e. dev, test, live, etc.)"
  );
}

new CdkBackendStack(app, "LTLSurvey-" + envStageName, {
  envStageName,
});
