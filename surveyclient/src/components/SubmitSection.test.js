/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import SubmitSection from "./SubmitSection";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { REFRESH_STATE, SET_AUTH_STATE } from "../model/ActionTypes";
import { SUBMIT } from "./FixedSectionTypes";
import { SIGNED_IN, SIGNED_OUT } from "../model/AuthStates";
import { Auth } from "@aws-amplify/auth";
import axios from "axios";
import { waitFor } from "@testing-library/dom";
import { INPUT_STATE } from "../model/TestUtils";

const TEST_ENDPOINT = "http://localhost:9999/testEndpoint";

const FIXED_UUID = "00000000-0000-0000-0000-000000000000";
jest.mock("uuid", () => ({ v4: () => "00000000-0000-0000-0000-000000000000" }));

jest.mock("@aws-amplify/auth");
jest.mock("axios");

var storedSectionId = null;
function setSectionId(sectionId) {
  storedSectionId = sectionId;
}

const SECTIONS = [{ id: "section1" }, { id: "section2" }, { id: SUBMIT }];

describe("component SubmitSection", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    // Populate state and auth state
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: INPUT_STATE_WITH_PHOTOS,
    });
    setSignedIn();

    Auth.currentSession.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();

    Auth.currentSession.mockImplementation(() => {
      return Promise.resolve({
        getIdToken: () => {
          return { getJwtToken: () => "test jwt token" };
        },
      });
    });
    axios.put.mockImplementation(() => Promise.resolve({ status: 200 }));
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  function setSignedIn() {
    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_IN,
      user: {
        attributes: {
          email: "test@example.com",
        },
      },
    });
  }

  it("initial state logged in", () => {
    setSignedIn();
    renderComponent();

    expect(sectionContent().textContent).toStrictEqual("UPLOAD…");
  });

  it("initial state not logged in", () => {
    surveyStore.dispatch({ type: SET_AUTH_STATE, authState: SIGNED_OUT });
    renderComponent();

    expect(sectionContent().textContent).toStrictEqual(
      "Login before submitting survey."
    );
  });

  it("bottom navigation", () => {
    storedSectionId = null;
    renderComponent();

    clickPreviousButton();
    expect(storedSectionId).toStrictEqual("section2");
  });

  it("upload without photos", () => {
    const inputState = { ...INPUT_STATE, photos: {}, photoDetails: {} };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    setSignedIn();

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

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkUploadSurveyCalled(inputState);
        checkConfirmSurveyCalled();
        checkPhotoUploadNotCalled();
        checkDialogComplete();
      });
  });

  it("upload with photos", () => {
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

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkUploadSurveyCalled(INPUT_STATE_WITH_PHOTOS);
        checkConfirmSurveyCalled();
        checkPhotosUploaded();
        checkDialogComplete();
      });
  });

  it("user.attributes.email not set", () => {
    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_IN,
      user: {
        attributes: {},
      },
    });

    renderComponent();

    clickUploadButton();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("user.attributes not set", () => {
    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_IN,
      user: {},
    });

    renderComponent();

    clickUploadButton();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("progress changes during upload", () => {
    // Set mock network requests with delays
    axios.post
      .mockImplementationOnce(() =>
        sleep(200).then(() =>
          Promise.resolve({
            data: UPLOAD_SURVEY_RESPONSE_WITH_PHOTOS,
            status: 200,
          })
        )
      )
      .mockImplementationOnce(() =>
        sleep(200).then(() =>
          Promise.resolve({
            data: CONFIRM_SURVEY_RESPONSE,
            status: 200,
          })
        )
      );
    axios.put
      .mockImplementationOnce(() =>
        sleep(200).then(() => Promise.resolve({ status: 200 }))
      )
      .mockImplementationOnce(() =>
        sleep(400).then(() => Promise.resolve({ status: 200 }))
      )
      .mockImplementationOnce(() =>
        sleep(600).then(() => Promise.resolve({ status: 200 }))
      );

    renderComponent();
    clickUploadButton();

    // Use waitFor(network request) and delays matching mocks above to test UX during upload
    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))
      .then(() => sleep(100)) // To give component time to process POST response
      .then(() => {
        checkDialogInProgress("0%", "Uploading survey response");
        return waitFor(() => expect(axios.put).toHaveBeenCalledTimes(3))
          .then(() => sleep(100)) // To give component time to process POST response
          .then(() => {
            checkDialogInProgress("20%", "Uploading photos");
            return sleep(200) // To match difference in photo upload put response times
              .then(() => {
                checkDialogInProgress("40%", "Uploading photos");
                return sleep(200) // To match difference in photo upload put response times
                  .then(() => {
                    checkDialogInProgress("60%", "Uploading photos");
                    return waitFor(() =>
                      expect(axios.post).toHaveBeenCalledTimes(2)
                    )
                      .then(() => sleep(100)) // To give component time to process POST response
                      .then(() => {
                        checkDialogInProgress("80%", "Confirming upload");
                        return sleep(300) // To give confirm upload response time to arrive
                          .then(() => {
                            checkDialogComplete();
                          });
                      });
                  });
              });
          });
      });
  });

  it("fail initial upload - non 200 response", () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: { message: "Failure in test" },
        status: 403,
      })
    );

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkUploadSurveyCalled(INPUT_STATE_WITH_PHOTOS);
        checkPhotoUploadNotCalled();
        checkDialogFailed("0%");
      });
  });

  it("fail initial upload - axios error", () => {
    axios.post.mockImplementationOnce(() =>
      Promise.reject(
        new Error({
          data: { message: "Failure in test" },
          status: 403,
        })
      )
    );

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkUploadSurveyCalled(INPUT_STATE_WITH_PHOTOS);
        checkPhotoUploadNotCalled();
        checkDialogFailed("0%");
      });
  });

  it("fail photo upload - non 200 response", () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: UPLOAD_SURVEY_RESPONSE_WITH_PHOTOS,
        status: 200,
      })
    );
    axios.put.mockImplementation(() => Promise.resolve({ status: 401 }));

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.put).toHaveBeenCalledTimes(3))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkUploadSurveyCalled(INPUT_STATE_WITH_PHOTOS);
        checkPhotosUploaded();
        checkDialogFailed("20%");
      });
  });

  it("fail photo upload - put error", () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: UPLOAD_SURVEY_RESPONSE_WITH_PHOTOS,
        status: 200,
      })
    );
    axios.put.mockImplementation(() =>
      Promise.reject(new Error("fake error message"))
    );

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.put).toHaveBeenCalledTimes(3))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkUploadSurveyCalled(INPUT_STATE_WITH_PHOTOS);
        checkPhotosUploaded();
        checkDialogFailed("20%");
      });
  });

  it("fail confirm upload - non 200 response", () => {
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

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkUploadSurveyCalled(INPUT_STATE_WITH_PHOTOS);
        checkConfirmSurveyCalled();
        checkPhotosUploaded();
        checkDialogFailed("80%");
      });
  });

  it("fail confirm upload - axios error", () => {
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

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkUploadSurveyCalled(INPUT_STATE_WITH_PHOTOS);
        checkConfirmSurveyCalled();
        checkPhotosUploaded();
        checkDialogFailed("80%");
      });
  });

  it("fail photo url missing", () => {
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

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkUploadSurveyCalled(INPUT_STATE_WITH_PHOTOS);
        checkPhotoUploadNotCalled();
        checkDialogFailed("0%");
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

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkUploadSurveyCalled(INPUT_STATE_WITH_PHOTOS);
        checkPhotoUploadNotCalled();
        checkDialogFailed("0%");
      });
  });

  it("fail confirmId missing", () => {
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

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkUploadSurveyCalled(INPUT_STATE_WITH_PHOTOS);
        expect(axios.put).not.toHaveBeenCalled();
        checkDialogFailed("0%");
      });
  });

  it("close dialog after complete", () => {
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

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkDialogComplete();

        act(() => clickCloseButton());

        renderComponent();
        expect(dialog()).toBeNull();
      });
  });

  it("close dialog after failure", () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: { message: "Failure in test" },
        status: 403,
      })
    );

    renderComponent();
    clickUploadButton();

    return waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))
      .then(() => sleep(200)) // To give component time to process POST response
      .then(() => {
        checkDialogFailed("0%");

        act(() => clickCloseButton());

        renderComponent();
        expect(dialog()).toBeNull();
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

  function checkDialogInProgress(progress, status) {
    // check final dialog state
    renderComponent();
    expect(dialogMessage().textContent).toStrictEqual("Please wait...");
    expect(progressBarValue()).toStrictEqual(progress);
    expect(dialogStatus().textContent).toStrictEqual(status);
    expect(closeButton()).toBeNull();
  }

  function checkDialogComplete() {
    // check final dialog state
    renderComponent();
    expect(dialogMessage().textContent).toStrictEqual(
      "Thank you for completing the survey"
    );
    expect(progressBarValue()).toStrictEqual("100%");
    expect(dialogStatus().textContent).toStrictEqual("Upload complete");
    expect(closeButton()).not.toBeNull();
  }

  function checkDialogFailed(progress) {
    // check final dialog state
    renderComponent();
    expect(dialogMessage()).toBeNull();
    expect(progressBarValue()).toStrictEqual(progress);
    expect(dialogStatus().textContent).toStrictEqual(
      "Upload failed - please try again"
    );
    expect(closeButton()).not.toBeNull();
  }

  const sectionContent = () => container.querySelector(".section .content");
  const previousButton = () =>
    container.querySelector(".section .previous-section-button");
  const uploadButton = () =>
    container.querySelector(".section .submit-survey-button");
  const dialog = () => document.querySelector(".dialog");
  const dialogMessage = () => document.querySelector(".dialog p");
  const dialogStatus = () =>
    document.querySelector(".dialog .submission-status");
  const closeButton = () => document.querySelector(".dialog .close-button");
  const progressBar = () =>
    document.querySelector(".dialog .progress-bar-active");

  function progressBarValue() {
    const styleValue = progressBar().getAttribute("style");
    return styleValue.substring(7, styleValue.length - 1);
  }

  function clickCloseButton() {
    closeButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
  function clickPreviousButton() {
    previousButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
  function clickUploadButton() {
    act(() => {
      uploadButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <SubmitSection
            sections={SECTIONS}
            setCurrentSection={setSectionId}
            endpoint={TEST_ENDPOINT}
          />
        </Provider>,
        container
      );
    });
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const INPUT_STATE_WITH_PHOTOS = {
    ...INPUT_STATE,
    photos: {
      testPhotoId1: { imageData: btoa("image data1") },
      testPhotoId2: { imageData: btoa("image data2") },
      testPhotoId3: { imageData: btoa("image data3") },
    },
    photoDetails: {
      testPhotoId1: {
        description: "test photo1",
        sectionId: "wellbeing",
        questionId: "colourful",
      },
      testPhotoId2: {
        description: "test photo2",
        sectionId: "wellbeing",
        questionId: "colourful",
      },
      testPhotoId3: {
        description: "test photo3",
      },
    },
  };

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
