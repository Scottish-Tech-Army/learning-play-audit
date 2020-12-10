const cdk = require("@aws-cdk/core");
const { HttpMethods, Bucket } = require("@aws-cdk/aws-s3");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const { NodejsFunction } = require("@aws-cdk/aws-lambda-nodejs");
const lambda = require("@aws-cdk/aws-lambda");
const apigateway = require("@aws-cdk/aws-apigateway");
const cognito = require("@aws-cdk/aws-cognito");

class CdkBackendStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

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

    const api = new apigateway.RestApi(this, "SurveyClientApi", {
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
        restApiId: api.restApiId,
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
        REGION: "eu-west-2", //TODO get from CDK environment
        SURVEY_DB_TABLE: surveyResponsesTable.tableName,
        SURVEY_RESOURCES_BUCKET: surveyResourcesBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    surveyResponsesTable.grant(addSurveyLambda, "dynamodb:PutItem");
    surveyResourcesBucket.grantPut(addSurveyLambda); // TODO restrict to uploads path?

    addApiGatewayMethod(api, "survey", "POST", addSurveyLambda, apiAuthoriser);

    const confirmSurveyLambda = new NodejsFunction(
      this,
      "ConfirmSurveyLambda",
      {
        runtime: lambda.Runtime.NODEJS_12_X,
        entry: "resources/confirmSurveyLambda/index.js",
        handler: "handler",
        environment: {
          REGION: "eu-west-2", //TODO get from CDK environment
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
      api,
      "confirmsurvey",
      "POST",
      confirmSurveyLambda,
      apiAuthoriser
    );

    function addApiGatewayMethod(
      api,
      resourcePath,
      method,
      lambdaFunction,
      apiAuthoriser
    ) {
      const resource = api.root.addResource(resourcePath);

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
