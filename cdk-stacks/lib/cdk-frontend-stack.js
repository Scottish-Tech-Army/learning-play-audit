const cdk = require("aws-cdk-lib");
const { Bucket } = require("aws-cdk-lib/aws-s3");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const origins = require("aws-cdk-lib/aws-cloudfront-origins");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");

class CdkFrontendStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, stackId, props) {
    super(scope, stackId, props);

    // React website hosting - survey client
    addHostedWebsite(this, "SurveyWebClient", "../surveyclient/build");

    // React website hosting - admin client
    addHostedWebsite(this, "AdminWebClient", "../adminclient/build");

    function addHostedWebsite(scope, name, pathToWebsiteContents) {
      const BUCKET_NAME = name;
      const DISTRIBUTION_NAME = name + "Distribution";
      const DEPLOY_NAME = name + "DeployWithInvalidation";

      const bucket = new Bucket(scope, BUCKET_NAME, {});

      const distribution = new cloudfront.Distribution(
        scope,
        DISTRIBUTION_NAME,
        {
          defaultBehavior: {
            origin: new origins.S3Origin(bucket),
            allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
            viewerProtocolPolicy:
              cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          },
          defaultRootObject: "index.html",
        }
      );

      new s3deploy.BucketDeployment(scope, DEPLOY_NAME, {
        sources: [s3deploy.Source.asset(pathToWebsiteContents)],
        destinationBucket: bucket,
        distribution,
      });

      new cdk.CfnOutput(scope, name + " URL", {
        value: "https://" + distribution.domainName,
        description: "External URL for " + name + " website",
      });
    }
  }
}

module.exports = { CdkFrontendStack };
