const cdk = require("@aws-cdk/core");
const { HttpMethods, Bucket } = require("@aws-cdk/aws-s3");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const { NodejsFunction } = require("@aws-cdk/aws-lambda-nodejs");
const lambda = require("@aws-cdk/aws-lambda");
const apigateway = require("@aws-cdk/aws-apigateway");
const cognito = require("@aws-cdk/aws-cognito");
const iam = require("@aws-cdk/aws-iam");
const cloudfront = require("@aws-cdk/aws-cloudfront");
const origins = require("@aws-cdk/aws-cloudfront-origins");
const s3deploy = require("@aws-cdk/aws-s3-deployment");

class CdkBackendStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // Common resources
    const stack = cdk.Stack.of(this);
    const region = stack.region;

    //provisionedthroughput - cost of lower
    //perhaps remove s3 abort

    const surveyResourcesBucket = new Bucket(this, "SurveyResources", {});
    surveyResourcesBucket.addCorsRule({
      allowedHeaders: ["*"],
      allowedMethods: [
        HttpMethods.GET,
        HttpMethods.HEAD,
        HttpMethods.PUT,
        HttpMethods.POST,
        HttpMethods.DELETE,
      ],
      allowedOrigins: ["*"],
      exposeHeaders: [
        "x-amz-server-side-encryption",
        "x-amz-request-id",
        "x-amz-id-2",
        "ETag",
      ],
      maxAge: 3000,
    });

    const surveyResponsesTable = new dynamodb.Table(this, "SurveyResponses", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    new cdk.CfnOutput(this, "SurveyResponses table", {
      value: surveyResponsesTable.tableName,
    });

    // Survey client resources

    const restApi = new apigateway.RestApi(this, "SurveyClientApi", {
      restApiName: "LTL Survey Client Service",
      description: "This service receives LTL Audit Survey reponses.",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });

    const surveyClientUserPool = new cognito.UserPool(this, "SurveyUserPool", {
      selfSignUpEnabled: true,
      // userVerification: {
      //   emailSubject: 'Verify your email for our awesome app!',
      //   emailBody: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
      //   emailStyle: cognito.VerificationEmailStyle.CODE,
      // },
      signInAliases: { email: true },
      autoVerify: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
      },
    });
    surveyClientUserPool.addClient("SurveyUserPoolAppClient", {
      accessTokenValidity: cdk.Duration.minutes(60),
      idTokenValidity: cdk.Duration.minutes(60),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    const apiAuthoriser = new apigateway.CfnAuthorizer(
      this,
      "SurveyClientApiAuth",
      {
        restApiId: restApi.restApiId,
        type: "COGNITO_USER_POOLS",
        identitySource: "method.request.header.Authorization",
        providerArns: [surveyClientUserPool.userPoolArn],
        name: "SurveyClientApiAuth",
      }
    );

    const addSurveyLambda = new NodejsFunction(this, "AddSurveyLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      entry: "resources/addSurveyLambda/index.js",
      handler: "handler",
      environment: {
        REGION: region,
        SURVEY_DB_TABLE: surveyResponsesTable.tableName,
        SURVEY_RESOURCES_BUCKET: surveyResourcesBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    surveyResponsesTable.grant(addSurveyLambda, "dynamodb:PutItem");
    surveyResourcesBucket.grantPut(addSurveyLambda); // TODO restrict to uploads path?

    addApiGatewayMethod(
      restApi,
      "survey",
      "POST",
      addSurveyLambda,
      apiAuthoriser
    );

    const confirmSurveyLambda = new NodejsFunction(
      this,
      "ConfirmSurveyLambda",
      {
        runtime: lambda.Runtime.NODEJS_12_X,
        entry: "resources/confirmSurveyLambda/index.js",
        handler: "handler",
        environment: {
          REGION: region,
          SURVEY_DB_TABLE: surveyResponsesTable.tableName,
        },
        timeout: cdk.Duration.seconds(30),
      }
    );

    surveyResponsesTable.grant(
      confirmSurveyLambda,
      "dynamodb:GetItem",
      "dynamodb:PutItem"
    );
    surveyResourcesBucket.grantReadWrite(confirmSurveyLambda); // TODO restrict to object move?

    addApiGatewayMethod(
      restApi,
      "confirmsurvey",
      "POST",
      confirmSurveyLambda,
      apiAuthoriser
    );

    // Admin client

    const adminClientUserPool = new cognito.UserPool(this, "SurveyAdminPool", {
      selfSignUpEnabled: false,
      // userVerification: {
      //   emailSubject: 'Verify your email for our awesome app!',
      //   emailBody: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
      //   emailStyle: cognito.VerificationEmailStyle.CODE,
      // },
      signInAliases: { email: true },
      autoVerify: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },

      // TODO - enable MFA for admin ?
    });
    const adminClientUserPoolClient = adminClientUserPool.addClient(
      "SurveyAdminPoolAppClient",
      {
        accessTokenValidity: cdk.Duration.minutes(60),
        idTokenValidity: cdk.Duration.minutes(60),
        refreshTokenValidity: cdk.Duration.days(30),
      }
    );

    const adminClientIdentityPool = new cognito.CfnIdentityPool(
      this,
      "AdminClientIdentityPool",
      {
        allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
        cognitoIdentityProviders: [
          {
            clientId: adminClientUserPoolClient.userPoolClientId,
            providerName: adminClientUserPool.userPoolProviderName,
          },
        ],
      }
    );

    // IAM role used for authenticated users
    const adminClientAuthenticatedRole = new iam.Role(
      this,
      "AdminClientAuthRole",
      {
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": adminClientIdentityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "authenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );
    adminClientAuthenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "mobileanalytics:PutEvents",
          "cognito-sync:*",
          "cognito-identity:*",
        ],
        resources: ["*"],
      })
    );

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      "AdminClientIdentityPoolRoleAttachment",
      {
        identityPoolId: adminClientIdentityPool.ref,
        roles: { authenticated: adminClientAuthenticatedRole.roleArn },
      }
    );

    //       adminClientAuthenticatedRole.role.addToPolicy(
    //   // IAM policy granting users permission to a specific folder in the S3 bucket
    //   new iam.PolicyStatement({
    //     actions: ["s3:*"],
    //     effect: iam.Effect.ALLOW,
    //     resources: [
    //       bucketArn + "/private/${cognito-identity.amazonaws.com:sub}/*",
    //     ],
    //   })
    // );
    surveyResponsesTable.grant(
      adminClientAuthenticatedRole,
      "dynamodb:GetItem",
      "dynamodb:Scan"
    );

    surveyResourcesBucket.grantRead(adminClientAuthenticatedRole); // TODO restrict to object move?

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
      });
    }

    function addApiGatewayMethod(
      restApi,
      resourcePath,
      method,
      lambdaFunction,
      apiAuthoriser
    ) {
      const resource = restApi.root.addResource(resourcePath);

      const postMethod = resource.addMethod(
        method,
        new apigateway.LambdaIntegration(lambdaFunction)
      );

      const postMethodResource = postMethod.node.findChild("Resource");
      postMethodResource.addPropertyOverride(
        "AuthorizationType",
        "COGNITO_USER_POOLS"
      );
      postMethodResource.addPropertyOverride("AuthorizerId", {
        Ref: apiAuthoriser.logicalId,
      });
    }
  }
}

module.exports = { CdkBackendStack };
