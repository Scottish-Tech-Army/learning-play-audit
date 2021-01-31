import surveyStore, {
  surveyReducer,
  getSummaryResponses,
  getFullResponses,
  getPhotoKeysForSurveys,
  getPhotosForSurveys,
  getPhotoUrl,
  allSurveysRetrieved,
  objectResponseToUint8Array,
} from "./SurveyModel";
import {
  REFRESH_STATE,
  SET_SUMMARY_RESPONSES,
  SET_FULL_RESPONSES,
  SET_PHOTOS,
} from "./ActionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "learning-play-audit-shared";
import rfdc from "rfdc";
import { Auth } from "@aws-amplify/auth";
import {
  DynamoDBClient,
  ScanCommand,
  BatchGetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createRequest } from "@aws-sdk/util-create-request";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { formatUrl } from "@aws-sdk/util-format-url";
import { ReadableStream } from "web-streams-polyfill/ponyfill";

jest.mock("@aws-amplify/auth");
jest.mock("@aws-sdk/client-dynamodb");
jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/util-create-request");
jest.mock("@aws-sdk/s3-request-presigner");
jest.mock("@aws-sdk/util-format-url");

const mockDynamodbClientSend = jest.fn();
const mockS3ClientSend = jest.fn();

beforeEach(() => {
  const AUTH_CREDENTIALS = "test credentials";

  Auth.currentCredentials.mockClear();
  DynamoDBClient.mockClear();
  S3Client.mockClear();

  Auth.currentCredentials.mockImplementation(() =>
    Promise.resolve(AUTH_CREDENTIALS)
  );
  DynamoDBClient.mockImplementation(() => {
    return { send: mockDynamodbClientSend };
  });
  S3Client.mockImplementation(() => {
    return { send: mockS3ClientSend };
  });

  mockDynamodbClientSend.mockReset();
  mockS3ClientSend.mockReset();
});

const clone = rfdc();

const PHOTOS_BUCKET = "bucket-surveyresources";
const DB_TABLE = "dbtable-responses";
const DB_TABLE_INDEX = "dbtable-index-responses";

process.env.REACT_APP_AWS_REGION = "eu-west-2";
process.env.REACT_APP_AWS_SURVEY_RESOURCES_S3_BUCKET = PHOTOS_BUCKET;
process.env.REACT_APP_AWS_SURVEY_RESPONSES_TABLE = DB_TABLE;
process.env.REACT_APP_AWS_SURVEY_RESPONSES_SUMMARY_INDEX = DB_TABLE_INDEX;

describe("surveyReducer", () => {
  it("initial state - empty", () => {
    expect(surveyReducer(undefined, {})).toStrictEqual(EMPTY_STATE);
  });

  it("action SET_SUMMARY_RESPONSES", () => {
    expect(
      surveyReducer(
        { ...EMPTY_STATE, surveyResponses: [] },
        {
          type: SET_SUMMARY_RESPONSES,
          responses: ["response1", "response2"],
        }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      surveyResponses: ["response1", "response2"],
    });

    expect(
      surveyReducer(
        { ...EMPTY_STATE, surveyResponses: ["oldresponse1", "oldresponse2"] },
        {
          type: SET_SUMMARY_RESPONSES,
          responses: ["response1", "response2"],
        }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      surveyResponses: ["response1", "response2"],
    });
  });

  it("action SET_FULL_RESPONSES", () => {
    expect(
      surveyReducer(
        { ...EMPTY_STATE, fullSurveyResponses: {} },
        {
          type: SET_FULL_RESPONSES,
          responses: { "1": "response1", "2": "response2" },
        }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      fullSurveyResponses: { "1": "response1", "2": "response2" },
    });

    expect(
      surveyReducer(
        {
          ...EMPTY_STATE,
          fullSurveyResponses: { "2": "oldresponse2", "3": "oldresponse3" },
        },
        {
          type: SET_FULL_RESPONSES,
          responses: { "1": "response1", "2": "response2" },
        }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      fullSurveyResponses: {
        "1": "response1",
        "2": "response2",
        "3": "oldresponse3",
      },
    });
  });

  it("action SET_PHOTOS", () => {
    expect(
      surveyReducer(
        { ...EMPTY_STATE, photos: {} },
        { type: SET_PHOTOS, photos: { "1": "photo1", "2": "photo2" } }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      photos: { "1": "photo1", "2": "photo2" },
    });

    expect(
      surveyReducer(
        { ...EMPTY_STATE, photos: { "2": "oldphoto2", "3": "oldphoto3" } },
        { type: SET_PHOTOS, photos: { "1": "photo1", "2": "photo2" } }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      photos: { "1": "photo1", "2": "photo2", "3": "oldphoto3" },
    });
  });

  it("action REFRESH_STATE", () => {
    expect(
      surveyReducer(EMPTY_STATE, {
        type: REFRESH_STATE,
        state: INPUT_STATE,
      })
    ).toStrictEqual(INPUT_STATE);

    expect(
      surveyReducer(INPUT_STATE, {
        type: REFRESH_STATE,
        state: EMPTY_STATE,
      })
    ).toStrictEqual(EMPTY_STATE);
  });
});

describe("surveyReducer using authReducer", () => {
  it("initial state - empty", () => {
    expect(surveyReducer(undefined, {})).toStrictEqual(EMPTY_STATE);
  });

  it("action SET_AUTH_ERROR", () => {
    expect(
      surveyReducer(STATE_WITHOUT_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "new error",
      })
    ).toStrictEqual(STATE_WITH_AUTH_ERROR);

    expect(
      surveyReducer(STATE_WITH_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "",
      })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);

    expect(
      surveyReducer(STATE_WITH_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "new error",
      })
    ).toStrictEqual(STATE_WITH_AUTH_ERROR);
  });

  it("action CLEAR_AUTH_ERROR", () => {
    expect(
      surveyReducer(STATE_WITH_AUTH_ERROR, { type: CLEAR_AUTH_ERROR })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);

    expect(
      surveyReducer(STATE_WITHOUT_AUTH_ERROR, { type: CLEAR_AUTH_ERROR })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);
  });

  it("action SET_AUTH_STATE", () => {
    expect(
      surveyReducer(
        {
          ...INPUT_STATE,
          authentication: {
            errorMessage: "new error",
            state: SIGN_IN,
            user: "test user",
          },
          hasSeenSplashPage: true,
          hasEverLoggedIn: false,
        },
        {
          type: SET_AUTH_STATE,
          authState: "new auth state",
          user: "new user",
        }
      )
    ).toStrictEqual({
      ...INPUT_STATE,
      authentication: {
        errorMessage: "",
        state: "new auth state",
        user: "new user",
      },
      hasSeenSplashPage: true,
      hasEverLoggedIn: false,
    });
  });

  it("action SET_AUTH_STATE authState undefined", () => {
    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_AUTH_STATE,
        user: "new user",
      })
    ).toStrictEqual(INPUT_STATE);
  });
});

describe("getSummaryResponses", () => {
  beforeEach(() => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: clone(SIGNEDIN_EMPTY_STATE),
    });

    ScanCommand.mockReset();
    mockDynamodbClientSend.mockImplementation(() =>
      Promise.resolve(DB_INDEX_RESPONSE)
    );
  });

  it("success", async () => {
    await surveyStore.dispatch(getSummaryResponses());

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(ScanCommand).toHaveBeenCalledTimes(1);
    const scanParameters = ScanCommand.mock.calls[0][0];
    expect(scanParameters.TableName).toStrictEqual(DB_TABLE);
    expect(scanParameters.IndexName).toStrictEqual("SummaryIndex");

    expect(mockDynamodbClientSend).toHaveBeenCalledTimes(1);
    expect(surveyStore.getState().surveyResponses).toStrictEqual([
      {
        createdAt: "2021-01-12T10:32:03.162Z",
        id: "surveyId1",
        responderEmail: "email1",
        responderName: "user1",
        schoolName: "school1",
      },
      {
        createdAt: "2021-02-12T10:32:03.162Z",
        id: "surveyId2",
        responderEmail: "email2",
        responderName: "user2",
        schoolName: "school2",
      },
    ]);
  });

  it("not signed in", async () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: clone(EMPTY_STATE) });
    await surveyStore.dispatch(getSummaryResponses());

    expect(Auth.currentCredentials).not.toHaveBeenCalled();
    expect(DynamoDBClient).not.toHaveBeenCalled();
    expect(mockDynamodbClientSend).not.toHaveBeenCalled();
    expect(surveyStore.getState().surveyResponses).toStrictEqual([]);
  });

  it("error calling DynamoDB send", async () => {
    mockDynamodbClientSend.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await surveyStore.dispatch(getSummaryResponses());

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(mockDynamodbClientSend).toHaveBeenCalledTimes(1);
    expect(surveyStore.getState().surveyResponses).toStrictEqual([]);
  });
});

describe("getFullResponses", () => {
  beforeEach(() => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: clone(SIGNEDIN_EMPTY_STATE),
    });

    BatchGetItemCommand.mockReset();
    mockDynamodbClientSend.mockImplementation(() =>
      Promise.resolve(DB_FULL_RESPONSE)
    );
  });

  it("success - empty existing responses", async () => {
    await surveyStore.dispatch(getFullResponses(["surveyId1", "surveyId2"]));

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(mockDynamodbClientSend).toHaveBeenCalledTimes(1);
    expect(BatchGetItemCommand).toHaveBeenCalledTimes(1);
    expect(BatchGetItemCommand.mock.calls[0][0].RequestItems).toStrictEqual({
      "dbtable-responses": {
        Keys: [{ id: { S: "surveyId1" } }, { id: { S: "surveyId2" } }],
      },
    });
    expect(surveyStore.getState().fullSurveyResponses).toStrictEqual(
      TEST_FULL_RESPONSES
    );
  });

  it("success - all responses already retrieved", async () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: clone(INPUT_STATE) });
    await surveyStore.dispatch(getFullResponses(["surveyId1", "surveyId2"]));

    expect(Auth.currentCredentials).not.toHaveBeenCalled();
    expect(DynamoDBClient).not.toHaveBeenCalled();
    expect(mockDynamodbClientSend).not.toHaveBeenCalled();
    expect(surveyStore.getState().fullSurveyResponses).toStrictEqual(
      TEST_FULL_RESPONSES
    );
  });

  it("success - some responses already retrieved", async () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        ...clone(INPUT_STATE),
        fullSurveyResponses: { surveyId1: TEST_FULL_RESPONSE1 },
      },
    });
    await surveyStore.dispatch(getFullResponses(["surveyId1", "surveyId2"]));

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(mockDynamodbClientSend).toHaveBeenCalledTimes(1);
    expect(BatchGetItemCommand).toHaveBeenCalledTimes(1);
    expect(BatchGetItemCommand.mock.calls[0][0].RequestItems).toStrictEqual({
      "dbtable-responses": {
        Keys: [{ id: { S: "surveyId2" } }],
      },
    });
    expect(surveyStore.getState().fullSurveyResponses).toStrictEqual(
      TEST_FULL_RESPONSES
    );
  });

  it("not signed in", async () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: clone(EMPTY_STATE) });
    await surveyStore.dispatch(getFullResponses(["surveyId1", "surveyId2"]));

    expect(Auth.currentCredentials).not.toHaveBeenCalled();
    expect(DynamoDBClient).not.toHaveBeenCalled();
    expect(mockDynamodbClientSend).not.toHaveBeenCalled();
    expect(surveyStore.getState().fullSurveyResponses).toStrictEqual({});
  });

  it("error calling DynamoDB send", async () => {
    mockDynamodbClientSend.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await surveyStore.dispatch(getFullResponses(["surveyId1", "surveyId2"]));

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(mockDynamodbClientSend).toHaveBeenCalledTimes(1);
    expect(surveyStore.getState().fullSurveyResponses).toStrictEqual({});
  });
});

describe("getPhotoKeysForSurveys", () => {
  it("success", async () => {
    expect(
      getPhotoKeysForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    ).toStrictEqual([
      "surveys/surveyId1/photos/photoId1",
      "surveys/surveyId2/photos/photoId2",
    ]);

    expect(
      getPhotoKeysForSurveys([SURVEY_WITHOUT_PHOTOS, SURVEY_WITHOUT_PHOTOS])
    ).toStrictEqual([]);

    expect(getPhotoKeysForSurveys([])).toStrictEqual([]);
  });
});

describe("getPhotosForSurveys", () => {
  beforeEach(() => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: clone(SIGNEDIN_EMPTY_STATE),
    });

    GetObjectCommand.mockReset();

    function getLastGetObjectCommandKey() {
      return GetObjectCommand.mock.calls[
        GetObjectCommand.mock.calls.length - 1
      ][0].Key;
    }

    function s3PhotoResponse(key) {
      return { Body: arrayToReadableStream(IMAGE_DATA, key) };
    }

    mockS3ClientSend.mockImplementation((input) => {
      return Promise.resolve(s3PhotoResponse(getLastGetObjectCommandKey()));
    });
  });

  it("success - empty existing photos", async () => {
    await surveyStore.dispatch(
      getPhotosForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    );

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(S3Client).toHaveBeenCalledTimes(1);
    expect(mockS3ClientSend).toHaveBeenCalledTimes(2);

    const expectedPhotoKeys = [
      "surveys/surveyId1/photos/photoId1",
      "surveys/surveyId2/photos/photoId2",
    ];
    checkGetObjectCommands(expectedPhotoKeys);
    checkStoredPhotos(expectedPhotoKeys);
  });

  it("success - all photos already retrieved", async () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        ...clone(INPUT_STATE),
        photos: {
          "surveys/surveyId1/photos/photoId1": {
            data: imageDataToUint8Array(
              IMAGE_DATA,
              "surveys/surveyId1/photos/photoId1"
            ),
            key: "surveys/surveyId1/photos/photoId1",
          },
          "surveys/surveyId2/photos/photoId2": {
            data: imageDataToUint8Array(
              IMAGE_DATA,
              "surveys/surveyId2/photos/photoId2"
            ),
            key: "surveys/surveyId2/photos/photoId2",
          },
        },
      },
    });
    await surveyStore.dispatch(
      getPhotosForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    );

    expect(Auth.currentCredentials).not.toHaveBeenCalled();
    expect(S3Client).not.toHaveBeenCalled();
    expect(mockS3ClientSend).not.toHaveBeenCalled();
    expect(GetObjectCommand).not.toHaveBeenCalled();
    checkStoredPhotos([
      "surveys/surveyId1/photos/photoId1",
      "surveys/surveyId2/photos/photoId2",
    ]);
  });

  it("success - some photos already retrieved", async () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        ...clone(INPUT_STATE),
        photos: {
          "surveys/surveyId1/photos/photoId1": {
            data: imageDataToUint8Array(
              IMAGE_DATA,
              "surveys/surveyId1/photos/photoId1"
            ),
            key: "surveys/surveyId1/photos/photoId1",
          },
        },
      },
    });
    await surveyStore.dispatch(
      getPhotosForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    );

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(S3Client).toHaveBeenCalledTimes(1);
    expect(mockS3ClientSend).toHaveBeenCalledTimes(1);
    checkGetObjectCommands(["surveys/surveyId2/photos/photoId2"]);
    checkStoredPhotos([
      "surveys/surveyId1/photos/photoId1",
      "surveys/surveyId2/photos/photoId2",
    ]);
  });

  it("not signed in", async () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: clone(EMPTY_STATE) });
    await surveyStore.dispatch(
      getPhotosForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    );

    expect(Auth.currentCredentials).not.toHaveBeenCalled();
    expect(S3Client).not.toHaveBeenCalled();
    expect(mockS3ClientSend).not.toHaveBeenCalled();
    expect(GetObjectCommand).not.toHaveBeenCalled();
    expect(surveyStore.getState().photos).toStrictEqual({});
  });

  it("error calling S3 send send", async () => {
    mockS3ClientSend.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await surveyStore.dispatch(
      getPhotosForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    );

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(S3Client).toHaveBeenCalledTimes(1);
    expect(mockS3ClientSend).toHaveBeenCalledTimes(2);
    checkGetObjectCommands([
      "surveys/surveyId1/photos/photoId1",
      "surveys/surveyId2/photos/photoId2",
    ]);
    expect(surveyStore.getState().photos).toStrictEqual({
      "surveys/surveyId1/photos/photoId1": {
        error: "[Image not found]",
        key: "surveys/surveyId1/photos/photoId1",
      },
      "surveys/surveyId2/photos/photoId2": {
        error: "[Image not found]",
        key: "surveys/surveyId2/photos/photoId2",
      },
    });
  });
});

describe("getPhotoUrl", () => {
  const mockS3RequestPresignerPresign = jest.fn();

  beforeEach(() => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: clone(SIGNEDIN_EMPTY_STATE),
    });

    GetObjectCommand.mockReset();
    createRequest.mockReset();
    createRequest.mockImplementation(() => Promise.resolve("created request"));
    mockS3RequestPresignerPresign.mockReset();
    mockS3RequestPresignerPresign.mockImplementation(() =>
      Promise.resolve("presigned request")
    );
    formatUrl.mockReset();
    formatUrl.mockImplementation(() => "formatted request");

    S3RequestPresigner.mockImplementation(() => {
      return { presign: mockS3RequestPresignerPresign };
    });
  });

  it("success", async () => {
    const url = await getPhotoUrl("testKey");

    // Lots of mocking means the test is only checking the promise wiring
    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(S3Client).toHaveBeenCalledTimes(1);
    expect(createRequest).toHaveBeenCalledTimes(1);
    expect(GetObjectCommand).toHaveBeenCalledTimes(1);
    expect(GetObjectCommand.mock.calls[0][0]).toStrictEqual({
      Bucket: "bucket-surveyresources",
      Key: "testKey",
    });
    expect(S3RequestPresigner).toHaveBeenCalledTimes(1);
    expect(mockS3RequestPresignerPresign).toHaveBeenCalledTimes(1);
    expect(mockS3RequestPresignerPresign.mock.calls[0][0]).toStrictEqual(
      "created request"
    );
    expect(formatUrl).toHaveBeenCalledTimes(1);
    expect(formatUrl.mock.calls[0][0]).toStrictEqual("presigned request");

    expect(url).toStrictEqual("formatted request");
  });
});

test("allSurveysRetrieved", () => {
  expect(
    allSurveysRetrieved(["key1", "key2"], { key1: "stuff", key2: "stuff" })
  ).toStrictEqual(true);
  expect(
    allSurveysRetrieved([], { key1: "stuff", key2: "stuff" })
  ).toStrictEqual(true);
  expect(allSurveysRetrieved([], {})).toStrictEqual(true);

  expect(
    allSurveysRetrieved(["key3"], { key1: "stuff", key2: "stuff" })
  ).toStrictEqual(false);
  expect(
    allSurveysRetrieved(["key1", "key3"], { key1: "stuff", key2: "stuff" })
  ).toStrictEqual(false);
  expect(allSurveysRetrieved(["key3"], {})).toStrictEqual(false);
});

// The first 48 bytes of a Jpeg
// prettier-ignore
const IMAGE_DATA = [
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
    0x00, 0x60, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
    0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12];

describe("objectResponseToUint8Array", () => {
  it("input readableStream", async () => {
    const readStream = arrayToReadableStream(IMAGE_DATA);
    const expectedData = new Uint8Array(IMAGE_DATA);
    return objectResponseToUint8Array(readStream).then((output) =>
      expect(output).toStrictEqual(expectedData)
    );
  });

  it("empty readableStream", async () => {
    const readStream = arrayToReadableStream([]);
    const expectedData = new Uint8Array([]);
    return objectResponseToUint8Array(readStream).then((output) =>
      expect(output).toStrictEqual(expectedData)
    );
  });

  it("input blob", async () => {
    const blob = new Blob([imageDataToUint8Array(IMAGE_DATA)]);
    const expectedData = new Uint8Array(IMAGE_DATA);
    return objectResponseToUint8Array(blob).then((output) =>
      expect(output).toStrictEqual(expectedData)
    );
  });

  it("empty blob", async () => {
    const blob = new Blob([]);
    const expectedData = new Uint8Array([]);
    return objectResponseToUint8Array(blob).then((output) =>
      expect(output).toStrictEqual(expectedData)
    );
  });
});

function imageDataToUint8Array(data, textSuffix = null) {
  const textCharCodes = textSuffix
    ? Array.from(textSuffix).map((char) => char.charCodeAt(0))
    : [];
  return new Uint8Array([...data, ...textCharCodes]);
}

function arrayToReadableStream(data, textSuffix = null) {
  return new ReadableStream({
    start(controller) {
      const array = imageDataToUint8Array(data, textSuffix);
      if (array.length > 0) {
        controller.enqueue(imageDataToUint8Array(data, textSuffix));
      }
      controller.close();
    },
    type: "bytes",
  });
}

function checkGetObjectCommands(expectedPhotoKeys) {
  expect(GetObjectCommand).toHaveBeenCalledTimes(expectedPhotoKeys.length);

  expectedPhotoKeys.forEach((key, i) => {
    expect(GetObjectCommand.mock.calls[i][0]).toStrictEqual({
      Bucket: "bucket-surveyresources",
      Key: key,
    });
  });
}

function checkStoredPhotos(expectedPhotoKeys) {
  const expectedPhotos = {};
  expectedPhotoKeys.forEach((key) => {
    expectedPhotos[key] = {
      data: imageDataToUint8Array(IMAGE_DATA, key),
      key: key,
    };
  });
  expect(surveyStore.getState().photos).toStrictEqual(expectedPhotos);
}

const EMPTY_STATE = {
  surveyResponses: [],
  fullSurveyResponses: {},
  photos: {},
  authentication: {
    errorMessage: "",
    state: SIGN_IN,
    user: undefined,
  },
};

const SIGNEDIN_EMPTY_STATE = {
  surveyResponses: [],
  fullSurveyResponses: {},
  photos: {},
  authentication: {
    errorMessage: "",
    state: SIGNED_IN,
    user: "test user",
  },
};

const TEST_FULL_RESPONSE1 = {
  __typename: "SurveyResponse",
  createdAt: "2021-01-18T19:57:51.675Z",
  id: "surveyId1",
  photos: [
    {
      bucket: "bucket-surveyresources",
      description: "photo description",
      fullsize: {
        height: 300,
        key: "surveys/surveyId1/photos/photoId1",
        uploadKey: null,
        width: 400,
      },
    },
  ],
  responderEmail: "email1",
  responderName: "user1",
  schoolName: "school1",
  state: "Complete",
  surveyResponse: {
    play: {
      tyres: {
        answer: "d",
        comments: "test comment",
      },
    },
    surveyVersion: "0.9.0",
  },
  surveyVersion: "0.9.0",
  updatedAt: "2021-01-18T19:57:54.869Z",
};

const TEST_FULL_RESPONSE2 = {
  __typename: "SurveyResponse",
  createdAt: "2021-02-18T19:57:51.675Z",
  id: "surveyId2",
  photos: [
    {
      bucket: "bucket-surveyresources",
      description: "photo description2",
      fullsize: {
        height: 300,
        key: "surveys/surveyId2/photos/photoId2",
        uploadKey: null,
        width: 400,
      },
    },
  ],
  responderEmail: "email2",
  responderName: "user2",
  schoolName: "school2",
  state: "Complete",
  surveyResponse: {
    play: {
      tyres: {
        answer: "d",
        comments: "test comment2",
      },
    },
    surveyVersion: "0.9.0",
  },
  surveyVersion: "0.9.0",
  updatedAt: "2021-02-18T19:57:54.869Z",
};

const SURVEY_WITHOUT_PHOTOS = {
  id: "surveyId3",
  photos: [],
  surveyResponse: {
    play: {
      tyres: {
        answer: "d",
        comments: "test comment",
      },
    },
  },
};

const TEST_FULL_RESPONSES = {
  surveyId1: TEST_FULL_RESPONSE1,
  surveyId2: TEST_FULL_RESPONSE2,
};

const DB_FULL_RESPONSE = {
  Responses: {
    "dbtable-responses": [
      {
        responderName: { S: "user1" },
        __typename: { S: "SurveyResponse" },
        photos: {
          L: [
            {
              M: {
                bucket: { S: PHOTOS_BUCKET },
                fullsize: {
                  M: {
                    width: { N: "400" },
                    uploadKey: { NULL: true },
                    key: { S: "surveys/surveyId1/photos/photoId1" },
                    height: { N: "300" },
                  },
                },
                description: { S: "photo description" },
              },
            },
          ],
        },
        surveyResponse: {
          M: {
            play: {
              M: {
                tyres: {
                  M: { answer: { S: "d" }, comments: { S: "test comment" } },
                },
              },
            },
            surveyVersion: { S: "0.9.0" },
          },
        },
        responderEmail: { S: "email1" },
        updatedAt: { S: "2021-01-18T19:57:54.869Z" },
        schoolName: { S: "school1" },
        createdAt: { S: "2021-01-18T19:57:51.675Z" },
        surveyVersion: { S: "0.9.0" },
        id: { S: "surveyId1" },
        state: { S: "Complete" },
      },
      {
        responderName: { S: "user2" },
        __typename: { S: "SurveyResponse" },
        photos: {
          L: [
            {
              M: {
                bucket: { S: PHOTOS_BUCKET },
                fullsize: {
                  M: {
                    width: { N: "400" },
                    uploadKey: { NULL: true },
                    key: { S: "surveys/surveyId2/photos/photoId2" },
                    height: { N: "300" },
                  },
                },
                description: { S: "photo description2" },
              },
            },
          ],
        },
        surveyResponse: {
          M: {
            play: {
              M: {
                tyres: {
                  M: { answer: { S: "d" }, comments: { S: "test comment2" } },
                },
              },
            },
            surveyVersion: { S: "0.9.0" },
          },
        },
        responderEmail: { S: "email2" },
        updatedAt: { S: "2021-02-18T19:57:54.869Z" },
        schoolName: { S: "school2" },
        createdAt: { S: "2021-02-18T19:57:51.675Z" },
        surveyVersion: { S: "0.9.0" },
        id: { S: "surveyId2" },
        state: { S: "Complete" },
      },
    ],
  },
  UnprocessedKeys: {},
};

const DB_INDEX_RESPONSE = {
  Count: 2,
  Items: [
    {
      responderName: { S: "user1" },
      schoolName: { S: "school1" },
      createdAt: { S: "2021-01-12T10:32:03.162Z" },
      id: { S: "surveyId1" },
      responderEmail: { S: "email1" },
    },
    {
      responderName: { S: "user2" },
      schoolName: { S: "school2" },
      createdAt: { S: "2021-02-12T10:32:03.162Z" },
      id: { S: "surveyId2" },
      responderEmail: { S: "email2" },
    },
  ],
  ScannedCount: 2,
};

const INPUT_STATE = {
  surveyResponses: ["surveyId1", "surveyId2"],
  fullSurveyResponses: TEST_FULL_RESPONSES,
  photos: { "1": "photo1", "2": "photo2" },
  authentication: {
    errorMessage: "",
    state: SIGNED_IN,
    user: undefined,
  },
};

const STATE_WITH_AUTH_ERROR = {
  ...INPUT_STATE,
  authentication: {
    errorMessage: "new error",
    state: SIGN_IN,
    user: "test user",
  },
};

const STATE_WITHOUT_AUTH_ERROR = {
  ...INPUT_STATE,
  authentication: { errorMessage: "", state: SIGN_IN, user: "test user" },
};
