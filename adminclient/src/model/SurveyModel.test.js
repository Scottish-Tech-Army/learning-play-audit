import surveyStore, {
  surveyReducer,
  refreshState,
  loadPhoto,
  getSummaryResponses,
  getFullResponses,
} from "./SurveyModel";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
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
  authReducer,
} from "learning-play-audit-shared";
import rfdc from "rfdc";
import { createStore, applyMiddleware } from "redux";
import { Auth } from "@aws-amplify/auth";
import {
  DynamoDBClient,
  ScanCommand,
  BatchGetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
const FIXED_UUID = "00000000-0000-0000-0000-000000000000";

jest.mock("@aws-amplify/auth");
jest.mock("@aws-sdk/client-dynamodb");
jest.mock("@aws-sdk/client-s3");

const clone = rfdc();

jest.mock("@aws-amplify/auth");

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
  const mockDynamodbClientSend = jest.fn();
  const AUTH_CREDENTIALS = "test credentials";

  beforeEach(() => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: clone(SIGNEDIN_EMPTY_STATE),
    });

    Auth.currentCredentials.mockReset();
    Auth.currentCredentials.mockImplementation(() =>
      Promise.resolve(AUTH_CREDENTIALS)
    );

    Auth.signIn.mockReset();
    DynamoDBClient.mockReset();
    ScanCommand.mockReset();
    mockDynamodbClientSend.mockReset();

    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));

    DynamoDBClient.mockImplementation(() => {
      return { send: mockDynamodbClientSend };
    });
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
  const mockDynamodbClientSend = jest.fn();
  const AUTH_CREDENTIALS = "test credentials";

  beforeEach(() => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: clone(SIGNEDIN_EMPTY_STATE),
    });

    Auth.currentCredentials.mockReset();
    Auth.currentCredentials.mockImplementation(() =>
      Promise.resolve(AUTH_CREDENTIALS)
    );

    Auth.signIn.mockReset();
    DynamoDBClient.mockReset();
    BatchGetItemCommand.mockReset();
    mockDynamodbClientSend.mockReset();

    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));

    DynamoDBClient.mockImplementation(() => {
      return { send: mockDynamodbClientSend };
    });
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
