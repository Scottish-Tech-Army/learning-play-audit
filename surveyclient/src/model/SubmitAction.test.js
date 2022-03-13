/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSubmitStateCalls"] }] */
import { uploadResults } from "./SubmitAction";
import { Auth } from "@aws-amplify/auth";
import axios from "axios";
import { INPUT_STATE } from "../model/TestUtils";
import {
  SUBMITTING_START,
  SUBMITTING_PHOTOS,
  SUBMITTING_CONFIRM,
  SUBMIT_COMPLETE,
  SUBMIT_FAILED,
} from "./SubmitStates";
import { Buffer } from 'buffer/';

const TEST_ENDPOINT = "http://localhost:9999/testEndpoint";

const FIXED_UUID = "00000000-0000-0000-0000-000000000000";
jest.mock("uuid", () => ({ v4: () => "00000000-0000-0000-0000-000000000000" }));

jest.mock("@aws-amplify/auth");
jest.mock("axios");

const setSubmitState = jest.fn();
const setProgressValue = jest.fn();

describe("uploadResults", () => {
  beforeEach(() => {
    Auth.currentSession.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    setSubmitState.mockReset();
    setProgressValue.mockReset();

    Auth.currentSession.mockImplementation(() => {
      return Promise.resolve({
        getIdToken: () => {
          return { getJwtToken: () => "test jwt token" };
        },
      });
    });
    axios.put.mockImplementation(() => Promise.resolve({ status: 200 }));
  });

  it("upload without photos", async () => {
    const inputState = { ...INPUT_STATE, photos: {}, photoDetails: {} };

    axios.post
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            result: "Pending upload",
            confirmId: "confirmId1",
            uploadUrls: {},
          },
          status: 200,
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: CONFIRM_SURVEY_RESPONSE,
          status: 200,
        })
      );

    await uploadResults(
      setSubmitState,
      setProgressValue,
      inputState,
      TEST_ENDPOINT
    ).then(() => {
      checkUploadSurveyCalled(inputState);
      checkConfirmSurveyCalled();
      checkPhotoUploadNotCalled();
      checkSubmitStateCalls(
        SUBMITTING_START,
        SUBMITTING_PHOTOS,
        SUBMITTING_CONFIRM,
        SUBMIT_COMPLETE
      );
      checkProgressValueCalls(0, 50, 100);
    });
  });

  it("upload with photos", async () => {
    axios.post
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: UPLOAD_SURVEY_RESPONSE_WITH_PHOTOS,
          status: 200,
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: CONFIRM_SURVEY_RESPONSE,
          status: 200,
        })
      );

    await uploadResults(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    ).then(() => {
      checkUploadSurveyCalled(INPUT_STATE);
      checkConfirmSurveyCalled();
      checkPhotosUploaded();
      checkSubmitStateCalls(
        SUBMITTING_START,
        SUBMITTING_PHOTOS,
        SUBMITTING_CONFIRM,
        SUBMIT_COMPLETE
      );
      checkProgressValueCalls(0, 20, 40, 60, 80, 100);
    });
  });

  it("user.attributes.email not set", async () => {
    const inputState = {
      ...INPUT_STATE,
      authentication: {
        errorMessage: "",
        state: "SignedIn",
        user: { attributes: {} },
      },
    };

    await uploadResults(
      setSubmitState,
      setProgressValue,
      inputState,
      TEST_ENDPOINT
    ).then(() => {
      expect(axios.post).not.toHaveBeenCalled();
      checkSubmitStateCalls(SUBMITTING_START, SUBMIT_FAILED);
      checkProgressValueCalls(0);
    });
  });

  it("user.attributes not set", async () => {
    const inputState = {
      ...INPUT_STATE,
      authentication: { errorMessage: "", state: "SignedIn", user: {} },
    };

    await uploadResults(
      setSubmitState,
      setProgressValue,
      inputState,
      TEST_ENDPOINT
    ).then(() => {
      expect(axios.post).not.toHaveBeenCalled();
      checkSubmitStateCalls(SUBMITTING_START, SUBMIT_FAILED);
      checkProgressValueCalls(0);
    });
  });

  it("fail initial upload - non 200 response", async () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: { message: "Failure in test" },
        status: 403,
      })
    );

    await uploadResults(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    ).then(() => {
      checkUploadSurveyCalled(INPUT_STATE);
      checkPhotoUploadNotCalled();
      checkSubmitStateCalls(SUBMITTING_START, SUBMIT_FAILED);
      checkProgressValueCalls(0);
    });
  });

  it("fail initial upload - axios error", async () => {
    axios.post.mockImplementationOnce(() =>
      Promise.reject(
        new Error({
          data: { message: "Failure in test" },
          status: 403,
        })
      )
    );

    await uploadResults(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    ).then(() => {
      checkUploadSurveyCalled(INPUT_STATE);
      checkPhotoUploadNotCalled();
      checkSubmitStateCalls(SUBMITTING_START, SUBMIT_FAILED);
      checkProgressValueCalls(0);
    });
  });

  it("fail photo upload - non 200 response", async () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: UPLOAD_SURVEY_RESPONSE_WITH_PHOTOS,
        status: 200,
      })
    );
    axios.put.mockImplementation(() => Promise.resolve({ status: 401 }));

    await uploadResults(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    ).then(() => {
      checkUploadSurveyCalled(INPUT_STATE);
      checkPhotosUploaded();
      checkSubmitStateCalls(SUBMITTING_START, SUBMITTING_PHOTOS, SUBMIT_FAILED);
      checkProgressValueCalls(0, 20);
    });
  });

  it("fail photo upload - put error", async () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: UPLOAD_SURVEY_RESPONSE_WITH_PHOTOS,
        status: 200,
      })
    );
    axios.put.mockImplementation(() =>
      Promise.reject(new Error("fake error message"))
    );

    await uploadResults(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    ).then(() => {
      checkUploadSurveyCalled(INPUT_STATE);
      checkPhotosUploaded();
      checkSubmitStateCalls(SUBMITTING_START, SUBMITTING_PHOTOS, SUBMIT_FAILED);
      checkProgressValueCalls(0, 20);
    });
  });

  it("fail confirm upload - non 200 response", async () => {
    axios.post
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: UPLOAD_SURVEY_RESPONSE_WITH_PHOTOS,
          status: 200,
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: CONFIRM_SURVEY_RESPONSE,
          status: 502,
        })
      );

    await uploadResults(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    ).then(() => {
      checkUploadSurveyCalled(INPUT_STATE);
      checkConfirmSurveyCalled();
      checkPhotosUploaded();
      checkSubmitStateCalls(
        SUBMITTING_START,
        SUBMITTING_PHOTOS,
        SUBMITTING_CONFIRM,
        SUBMIT_FAILED
      );
      checkProgressValueCalls(0, 20, 40, 60, 80);
    });
  });

  it("fail confirm upload - axios error", async () => {
    axios.post
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: UPLOAD_SURVEY_RESPONSE_WITH_PHOTOS,
          status: 200,
        })
      )
      .mockImplementationOnce(() =>
        Promise.reject(
          new Error({
            data: { message: "Failure in test" },
            status: 403,
          })
        )
      );

    await uploadResults(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    ).then(() => {
      checkUploadSurveyCalled(INPUT_STATE);
      checkConfirmSurveyCalled();
      checkPhotosUploaded();
      checkSubmitStateCalls(
        SUBMITTING_START,
        SUBMITTING_PHOTOS,
        SUBMITTING_CONFIRM,
        SUBMIT_FAILED
      );
      checkProgressValueCalls(0, 20, 40, 60, 80);
    });
  });

  it("fail photo url missing", async () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          result: "Pending upload",
          confirmId: "confirmId1",
          uploadUrls: {
            testPhotoId1: "http://localhost:9999/uploadUrl1",
            // testPhotoId2 missing
            testPhotoId3: "http://localhost:9999/uploadUrl3",
          },
        },
        status: 200,
      })
    );

    await uploadResults(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    ).then(() => {
      checkUploadSurveyCalled(INPUT_STATE);
      checkPhotoUploadNotCalled();
      checkSubmitStateCalls(SUBMITTING_START, SUBMIT_FAILED);
      checkProgressValueCalls(0);
    });
  });

  it("fail photo urls block missing", async () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          result: "Pending upload",
          confirmId: "confirmId1",
        },
        status: 200,
      })
    );

    await uploadResults(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    ).then(() => {
      checkUploadSurveyCalled(INPUT_STATE);
      checkPhotoUploadNotCalled();
      checkSubmitStateCalls(SUBMITTING_START, SUBMIT_FAILED);
      checkProgressValueCalls(0);
    });
  });

  it("fail confirmId missing", async () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          result: "Pending upload",
          uploadUrls: {
            testPhotoId1: "http://localhost:9999/uploadUrl1",
            testPhotoId2: "http://localhost:9999/uploadUrl2",
            testPhotoId3: "http://localhost:9999/uploadUrl3",
          },
        },
        status: 200,
      })
    );

    await uploadResults(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    ).then(() => {
      checkUploadSurveyCalled(INPUT_STATE);
      checkPhotoUploadNotCalled();
      checkSubmitStateCalls(SUBMITTING_START, SUBMIT_FAILED);
      checkProgressValueCalls(0);
    });
  });

  function checkUploadSurveyCalled(state) {
    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      TEST_ENDPOINT + "/survey",
      JSON.stringify({
        uuid: FIXED_UUID,
        survey: state.answers,
        photoDetails: state.photoDetails,
      }),
      {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: "Bearer test jwt token",
        },
      }
    );
  }

  function checkConfirmSurveyCalled() {
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      TEST_ENDPOINT + "/confirmsurvey",
      JSON.stringify({ uuid: FIXED_UUID, confirmId: "confirmId1" }),
      {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: "Bearer test jwt token",
        },
      }
    );
  }

  function checkPhotoUploadNotCalled() {
    expect(axios.put).not.toHaveBeenCalled();
  }

  function checkPhotosUploaded() {
    expect(axios.put).toHaveBeenCalledTimes(3);
    expect(axios.put).toHaveBeenNthCalledWith(
      1,
      "http://localhost:9999/uploadUrl1",
      Buffer.from("image data1"),
      { headers: { "Content-Type": "image" } }
    );
    expect(axios.put).toHaveBeenNthCalledWith(
      2,
      "http://localhost:9999/uploadUrl2",
      Buffer.from("image data2"),
      { headers: { "Content-Type": "image" } }
    );
    expect(axios.put).toHaveBeenNthCalledWith(
      3,
      "http://localhost:9999/uploadUrl3",
      Buffer.from("image data3"),
      { headers: { "Content-Type": "image" } }
    );
  }

  function checkSubmitStateCalls(...expectedValues) {
    expect(setSubmitState).toHaveBeenCalledTimes(expectedValues.length);
    expectedValues.forEach((expectedValue, i) => {
      expect(setSubmitState).toHaveBeenNthCalledWith(i + 1, expectedValue);
    });
  }

  function checkProgressValueCalls(...expectedValues) {
    expect(setProgressValue).toHaveBeenCalledTimes(expectedValues.length);
    expectedValues.forEach((expectedValue, i) => {
      expect(setProgressValue).toHaveBeenNthCalledWith(i + 1, expectedValue);
    });
  }

  const UPLOAD_SURVEY_RESPONSE_WITH_PHOTOS = {
    result: "Pending upload",
    confirmId: "confirmId1",
    uploadUrls: {
      testPhotoId1: "http://localhost:9999/uploadUrl1",
      testPhotoId2: "http://localhost:9999/uploadUrl2",
      testPhotoId3: "http://localhost:9999/uploadUrl3",
    },
  };

  const CONFIRM_SURVEY_RESPONSE = { result: "Submission complete" };
});
