require("es6-promise").polyfill();
require("isomorphic-fetch");
const {
  CopyObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { s3Client, dynamodbClient, lambdaClient } = require("./aws");
const { InvokeCommand, InvocationType } = require("@aws-sdk/client-lambda");

const STATE_COMPLETE = "Complete";

function getSurveyResponse(surveyId) {
  console.log("getSurveyResponse", surveyId);

  var params = {
    TableName: process.env.SURVEY_DB_TABLE,
    Key: marshall({ id: surveyId }),
  };

  return dynamodbClient.send(new GetItemCommand(params)).then((result) => {
    console.log("Retrieved item:", result);
    const survey = unmarshall(result.Item);
    console.log("Retrieved survey:", survey);
    return survey;
  });
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

async function movePhotos(survey) {
  const result = await Promise.all(
    survey.photos.map((photo) => movePhoto(photo))
  );
  console.log("moved photos result", result);
  return Promise.resolve();
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
  return dynamodbClient.send(new PutItemCommand(params)).then((result) => {
    console.log("Update result", result);
    return Promise.resolve();
  });
}

async function sendSurveyConfirmationEmail(surveyId) {
  console.log("Async send email");
  const command = new InvokeCommand({
    FunctionName: process.env.EMAIL_FUNCTION,
    InvocationType: InvocationType.Event,
    Payload: JSON.stringify({ surveyId }),
  });
  console.log("command created");

  const result = await lambdaClient
    .send(command);

      console.log("Async send email result", result);
    //.catch((err) => console.log("Failed", err));
}

exports.handler = async (event) => {
  console.log("Incoming request", event);
  const inputRequest = JSON.parse(event.body);
  console.log(inputRequest);

  const surveyId = inputRequest.confirmId;
  const survey = await getSurveyResponse(surveyId);

  await movePhotos(survey);
  await updateSurveyResponse(survey);
  await sendSurveyConfirmationEmail(surveyId);

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
