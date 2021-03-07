/* Amplify Params - DO NOT EDIT
	API_LTLSURVEY_GRAPHQLAPIENDPOINTOUTPUT
	API_LTLSURVEY_GRAPHQLAPIIDOUTPUT
	API_LTLSURVEY_SURVEYRESPONSETABLE_ARN
	API_LTLSURVEY_SURVEYRESPONSETABLE_NAME
	ENV
	REGION
	STORAGE_SURVEYPHOTOS_BUCKETNAME
Amplify Params - DO NOT EDIT */

require("es6-promise").polyfill();
require("isomorphic-fetch");
const uuid = require("uuid");
const {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const s3Client = new S3Client(process.env.REGION);
const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });

const STATE_COMPLETE = "Complete";

function getSurveyResponse(surveyId) {
  console.log("getSurveyResponse", surveyId);

  var params = {
    TableName: process.env.SURVEY_DB_TABLE,
    Key: marshall({ id: surveyId }),
  };

  return dynamodbClient.send(new GetItemCommand(params));
}

function movePhoto(photo) {
  console.log("movePhoto", photo);

  const uploadKey = photo.fullsize.uploadKey;
  if (uploadKey === null || uploadKey.length === 0) {
    console.log("No photo to move");
    return Promise.resolve("No photo to move");
  }

  return s3Client
    .send(
      new CopyObjectCommand({
        Bucket: photo.bucket,
        CopySource: photo.bucket + "/" + uploadKey,
        Key: photo.fullsize.key,
      })
    )
    .then((result) => {
      console.log("copy result", result);
      return s3Client.send(
        new DeleteObjectCommand({
          Bucket: photo.bucket,
          Key: uploadKey,
        })
      );
    })
    .then((result) => {
      console.log("delete result", result);
      photo.fullsize.uploadKey = null;
      return Promise.resolve("Photo moved");
    });
}

function movePhotos(survey) {
  return Promise.all(survey.photos.map((photo) => movePhoto(photo)));
}

async function updateSurveyResponse(surveyResponse) {
  console.log("updateSurveyResponse", JSON.stringify(surveyResponse));

  const params = {
    TableName: process.env.SURVEY_DB_TABLE,
    Item: marshall({
      ...surveyResponse,
      uploadState: STATE_COMPLETE,
      updatedAt: new Date().toISOString(),
    }),
  };

  console.log("Updating item...", params);
  return dynamodbClient.send(new PutItemCommand(params));
}

exports.handler = async (event) => {
  console.log("Incoming request");
  const inputRequest = JSON.parse(event.body);
  console.log(inputRequest);

  const surveyId = inputRequest.confirmId;
  let survey = null;

  const updateResult = await getSurveyResponse(surveyId)
    .then((result) => {
      console.log("Retrieved item:", result);
      survey = unmarshall(result.Item);
      console.log("Retrieved survey:", survey);

      return movePhotos(survey);
    })
    .then((result) => {
      console.log("moved photos result", result);
      return updateSurveyResponse(survey);
    });

  console.log("Update result", updateResult);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
    },
    body: JSON.stringify({ result: "Submission complete" }),
  };
};
