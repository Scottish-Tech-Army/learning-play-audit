import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {
  SET_SUMMARY_RESPONSES,
  SET_FULL_RESPONSES,
  SET_PHOTOS,
  REFRESH_STATE,
} from "./ActionTypes";
import { authReducer, SIGN_IN, SIGNED_IN } from "learning-play-audit-shared";
import { Auth } from "@aws-amplify/auth";
import {
  DynamoDBClient,
  ScanCommand,
  BatchGetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createRequest } from "@aws-sdk/util-create-request";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { formatUrl } from "@aws-sdk/util-format-url";
import GrowableUint8Array from "@fictivekin/growable-uint8-array";

// Configure these properties in .env.local
const REGION = process.env.REACT_APP_AWS_REGION;
const SURVEY_RESOURCES_S3_BUCKET =
  process.env.REACT_APP_AWS_SURVEY_RESOURCES_S3_BUCKET;
const SURVEY_RESPONSES_TABLE = process.env.REACT_APP_AWS_SURVEY_RESPONSES_TABLE;
const SURVEY_RESPONSES_SUMMARY_INDEX =
  process.env.REACT_APP_AWS_SURVEY_RESPONSES_SUMMARY_INDEX;

const IMAGE_NOT_FOUND = "[Image not found]";

function initialState() {
  // console.log("Setting initialState");
  return {
    surveyResponses: [],
    fullSurveyResponses: {},
    photos: {},
    authentication: {
      errorMessage: "",
      state: SIGN_IN,
      user: undefined,
    },
  };
}

// Exported for unit tests only
function surveyAnswersReducer(state, action) {
  switch (action.type) {
    case SET_SUMMARY_RESPONSES:
      // console.log("SET_SUMMARY_RESPONSES", action);
      return { ...state, surveyResponses: action.responses };

    case SET_FULL_RESPONSES:
      // console.log("SET_FULL_RESPONSES", action);
      return {
        ...state,
        fullSurveyResponses: {
          ...state.fullSurveyResponses,
          ...action.responses,
        },
      };

    case SET_PHOTOS:
      // console.log("SET_PHOTOS", action);
      return {
        ...state,
        photos: { ...state.photos, ...action.photos },
      };

    case REFRESH_STATE:
      // console.log("REFRESH_STATE", action.state);
      return action.state;

    default:
      // console.log("Unknown action: ", action);
      return state;
  }
}

export function getSummaryResponses() {
  // console.log("getSummaryResponses");
  return function (dispatch, getState) {
    if (getState().authentication.state !== SIGNED_IN) {
      console.error("User not signed in");
      return Promise.resolve("User not signed in");
    }

    return Auth.currentCredentials()
      .then((credentials) => {
        const dynamodbClient = new DynamoDBClient({
          region: REGION,
          credentials: credentials,
        });
        const params = {
          TableName: SURVEY_RESPONSES_TABLE,
          IndexName: SURVEY_RESPONSES_SUMMARY_INDEX,
          ReturnConsumedCapacity: "TOTAL",
        };
        // console.log("Scanning data", params);
        return dynamodbClient.send(new ScanCommand(params));
      })
      .then((result) => {
        dispatch({
          type: SET_SUMMARY_RESPONSES,
          responses: result.Items.map((item) => unmarshall(item)),
        });
      })
      .catch((error) => {
        console.log("Error retrieving data", error);
        return Promise.resolve();
      });
  };
}

export function getFullResponses(surveyIds) {
  // console.log("getFullResponses", surveyIds);
  return function (dispatch, getState) {
    if (getState().authentication.state !== SIGNED_IN) {
      console.error("User not signed in");
      return Promise.resolve("User not signed in");
    }

    const surveyIdsToRetrieve = getSurveyIdsToRetrieve(
      surveyIds,
      getState().fullSurveyResponses
    );
    if (surveyIdsToRetrieve.length === 0) {
      console.log("no full responses to retrieve");
      return Promise.resolve();
    }

    return Auth.currentCredentials()
      .then((credentials) => {
        const dynamodbClient = new DynamoDBClient({
          region: REGION,
          credentials: credentials,
        });
        const params = {
          RequestItems: {},
          ReturnConsumedCapacity: "TOTAL",
        };
        params.RequestItems[SURVEY_RESPONSES_TABLE] = {
          Keys: surveyIdsToRetrieve.map((id) => {
            return { id: { S: id } };
          }),
        };
        // console.log("Retrieving full responses data", params);
        return dynamodbClient.send(new BatchGetItemCommand(params));
      })
      .then((result) => {
        const retrievedResponses = result.Responses[
          SURVEY_RESPONSES_TABLE
        ].map((item) => unmarshall(item));
        const responsesMap = retrievedResponses.reduce((acc, response) => {
          acc[response.id] = response;
          return acc;
        }, {});
        dispatch({
          type: SET_FULL_RESPONSES,
          responses: responsesMap,
        });
      })
      .catch((error) => {
        console.log("User not logged in", error);
        return Promise.resolve();
      });
  };
}

export function getPhotosForSurveys(surveys) {
  // console.log("getPhotosForSurveys", surveys);
  return getPhotos(getPhotoKeysForSurveys(surveys));
}

export function getPhotoKeysForSurveys(surveys) {
  // console.log("getPhotoKeysForSurveys", surveys);
  return surveys
    .filter((survey) => survey.photos.length > 0)
    .map((survey) => survey.photos.map((photo) => photo.fullsize.key))
    .flat();
}

function getPhotos(photoKeys) {
  // console.log("getPhotos", photoKeys);
  return function (dispatch, getState) {
    if (getState().authentication.state !== SIGNED_IN) {
      console.error("User not signed in");
      return Promise.resolve("User not signed in");
    }

    const existingPhotos = getState().photos;
    const remainingPhotoKeys = photoKeys.filter(
      (photoKey) => !existingPhotos.hasOwnProperty(photoKey)
    );

    if (remainingPhotoKeys.length === 0) {
      console.log("All photos already retrieved");
      return Promise.resolve();
    }

    return Auth.currentCredentials()
      .then((credentials) => {
        const s3 = new S3Client({ region: REGION, credentials });
        return Promise.allSettled(
          remainingPhotoKeys.map((photoKey) => getPhoto(s3, photoKey))
        );
      })
      .then((photodata) => {
        const photosMap = photodata
          .map((item) => item.value)
          .reduce((acc, photo) => {
            acc[photo.key] = photo;
            return acc;
          }, {});

        dispatch({
          type: SET_PHOTOS,
          photos: photosMap,
        });
      });
  };
}

function getPhoto(s3, photoKey) {
  return s3
    .send(
      new GetObjectCommand({
        Bucket: SURVEY_RESOURCES_S3_BUCKET,
        Key: photoKey,
      })
    )
    .then((photoData) => objectResponseToUint8Array(photoData.Body))
    .then((array) => Promise.resolve({ key: photoKey, data: array }))
    .catch((error) => {
      console.error("Error retrieving photo", photoKey, error);
      return Promise.resolve({ key: photoKey, error: IMAGE_NOT_FOUND });
    });
}

// Exported for unit tests
export function objectResponseToUint8Array(responseBody) {
  if (typeof Blob === "function" && responseBody instanceof Blob) {
    return new Promise(function (resolve) {
      var reader = new FileReader();

      reader.onloadend = function () {
        resolve(reader.result);
      };

      reader.readAsArrayBuffer(responseBody);
    }).then((arrayBuffer) => Promise.resolve(new Uint8Array(arrayBuffer)));
  }

  // responseBody == ReadableStream
  const incoming = new GrowableUint8Array();
  const reader = responseBody.getReader();
  async function readStream() {
    let isDone = false;
    while (!isDone) {
      const { done, value } = await reader.read();
      if (value) {
        incoming.extend(value);
      }
      isDone = done;
    }
  }
  return readStream().then(() => Promise.resolve(incoming.unwrap()));
}

export function getPhotoUrl(photoKey) {
  let s3 = undefined;
  return Auth.currentCredentials()
    .then((credentials) => {
      s3 = new S3Client({ region: REGION, credentials });
      return createRequest(
        s3,
        new GetObjectCommand({
          Bucket: SURVEY_RESOURCES_S3_BUCKET,
          Key: photoKey,
        })
      );
    })
    .then((request) => {
      const signer = new S3RequestPresigner({ ...s3.config });
      return signer.presign(request, { expiresIn: 900 });
    })
    .then((presignedRequest) => Promise.resolve(formatUrl(presignedRequest)));
}

function getSurveyIdsToRetrieve(selectedSurveyIds, fullSurveyResponses) {
  return selectedSurveyIds.filter(
    (surveyId) => !fullSurveyResponses.hasOwnProperty(surveyId)
  );
}

export function allSurveysRetrieved(selectedSurveyIds, fullSurveyResponses) {
  return (
    getSurveyIdsToRetrieve(selectedSurveyIds, fullSurveyResponses).length === 0
  );
}

// Exported for unit tests
export function surveyReducer(state = initialState(), action) {
  return surveyAnswersReducer(authReducer(state, action), action);
}

export default createStore(surveyReducer, applyMiddleware(thunk));
