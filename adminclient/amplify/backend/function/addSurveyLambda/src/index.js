/* Amplify Params - DO NOT EDIT
	API_LTLSURVEY_GRAPHQLAPIENDPOINTOUTPUT
	API_LTLSURVEY_GRAPHQLAPIIDOUTPUT
	API_LTLSURVEY_PHOTOTABLE_ARN
	API_LTLSURVEY_PHOTOTABLE_NAME
	API_LTLSURVEY_SURVEYRESPONSETABLE_ARN
	API_LTLSURVEY_SURVEYRESPONSETABLE_NAME
	ENV
	REGION
	STORAGE_SURVEYPHOTOS_BUCKETNAME
Amplify Params - DO NOT EDIT */

require("es6-promise").polyfill();
require("isomorphic-fetch");
const AWS = require("aws-sdk");
const S3 = new AWS.S3({ signatureVersion: "v4" });
const AUTH_TYPE = require("aws-appsync").AUTH_TYPE;
const AWSAppSyncClient = require("aws-appsync").default;
const uuid = require("uuid");
const gql = require("graphql-tag");

let client = null;

async function storeSurveyResponse(surveyResponse) {
  console.log("storeSurveyResponse", JSON.stringify(surveyResponse));
  const createSurveyResponse = gql`
    mutation CreateSurveyResponse(
      $input: CreateSurveyResponseInput!
      $condition: ModelSurveyResponseConditionInput
    ) {
      createSurveyResponse(input: $input, condition: $condition) {
        id
        surveyVersion
        surveyResponse
        photos {
          bucket
          description
          fullsize {
            key
            width
            height
          }
        }
        schoolName
        responderName
        responderEmail
        createdAt
        updatedAt
        owner
      }
    }
  `;

  console.log(
    "trying to createSurveyResponse with input",
    JSON.stringify(surveyResponse)
  );
  const result = await client.mutate({
    mutation: createSurveyResponse,
    variables: { input: surveyResponse },
    fetchPolicy: "no-cache",
  });

  console.log("result", JSON.stringify(result));
  return result;
}

exports.handler = async (event) => {
  console.log(event);
  const inputRequest = JSON.parse(event.body);
  console.log(inputRequest);

  client = new AWSAppSyncClient({
    url: process.env.API_LTLSURVEY_GRAPHQLAPIENDPOINTOUTPUT,
    region: process.env.REGION,
    auth: {
      type: AUTH_TYPE.AWS_IAM,
      credentials: AWS.config.credentials,
    },
    disableOffline: true,
  });

  const survey = inputRequest.survey;

  const surveyId = uuid.v4();
  const clientSurveyId = inputRequest.uuid;
  console.log("Mapping survey id: " + clientSurveyId + " -> " + surveyId);

  const photos = [];
  const surveyResponse = {
    id: surveyId,
    surveyVersion: survey.surveyVersion,
    surveyResponse: JSON.stringify(survey),
    schoolName: survey.background.school.answer,
    responderName: survey.background.contactname.answer,
    responderEmail: survey.background.email.answer,
    photos: photos,
  };

  const clientPhotoIds = inputRequest.photos
    ? Object.keys(inputRequest.photos)
    : [];
  console.log(clientPhotoIds);
  var i;
  for (i = 0; i < clientPhotoIds.length; i++) {
    const clientPhotoId = clientPhotoIds[i];
    const photoId = uuid.v4();
    const photoS3Key = "surveys/" + surveyId + "/photos/" + photoId;
    console.log("Mapping photo id: " + clientPhotoId + " -> " + photoId);

    const imageData = Buffer.from(
      inputRequest.photos[clientPhotoId].imageData,
      "base64"
    );

    const imageDescription = inputRequest.photoDetails[clientPhotoId].description;

    const putResult = await S3.putObject({
      Body: imageData,
      Bucket: process.env.STORAGE_SURVEYPHOTOS_BUCKETNAME,
      Key: "public/" + photoS3Key,
      ContentType: "image",
    }).promise();
    console.log(putResult);

    photos.push({
      bucket: process.env.STORAGE_SURVEYPHOTOS_BUCKETNAME,
      description: imageDescription,
      fullsize: {
        key: photoS3Key,
        width: 400,
        height: 300,
      },
    });
  }

  console.log(JSON.stringify(surveyResponse));
  const result = await storeSurveyResponse(surveyResponse);

  const response = {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*"
    //  },
    body: JSON.stringify({result: "Success"}),
  };
  return response;
};
