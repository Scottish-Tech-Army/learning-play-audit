#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { CdkBackendStack } = require('../lib/cdk-backend-stack');

const app = new cdk.App();
new CdkBackendStack(app, 'CdkBackendStack');
