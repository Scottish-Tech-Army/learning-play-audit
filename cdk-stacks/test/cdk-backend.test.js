const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require("aws-cdk-lib");
const CdkBackend = require('../lib/cdk-backend-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CdkBackend.CdkBackendStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
