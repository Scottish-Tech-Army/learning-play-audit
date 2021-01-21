/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import { uploadResults } from "../model/SubmitAction";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import SubmitSection from "./SubmitSection";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { REFRESH_STATE } from "../model/ActionTypes";
import { SUBMIT } from "./FixedSectionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  signOut,
  authReducer,
} from "learning-play-audit-shared";
import { INPUT_STATE, EMPTY_STATE } from "../model/TestUtils";
import {
  SUBMITTING_START,
  SUBMITTING_PHOTOS,
  SUBMITTING_CONFIRM,
  SUBMIT_COMPLETE,
  SUBMIT_FAILED,
} from "../model/SubmitStates";

const TEST_ENDPOINT = "http://localhost:9999/testEndpoint";

jest.mock("learning-play-audit-shared", () => {
  const originalShared = jest.requireActual("learning-play-audit-shared");
  return { ...originalShared, signOut: jest.fn(), authReducer: jest.fn() };
});
jest.mock("../model/SubmitAction");

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

    const inputState = {
      ...INPUT_STATE,
      authentication: {
        errorMessage: "",
        state: SIGNED_IN,
        user: { attributes: { email: "test@example.com" } },
      },
    };

    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });

    uploadResults.mockReset();
    authReducer.mockImplementation((state) => state);

    signOut.mockReset();
    signOut.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial state logged in", () => {
    renderComponent();

    expect(sectionContent().textContent).toStrictEqual("UPLOAD…");
  });

  it("initial state not logged in", () => {
    const inputState = {
      ...INPUT_STATE,
      authentication: { errorMessage: "", state: SIGN_IN, user: undefined },
    };

    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderComponent();

    expect(sectionContent().textContent).toStrictEqual(
      "Login before submitting survey."
    );
  });

  it("bottom navigation", () => {
    storedSectionId = null;
    renderComponent();

    click(previousButton());
    expect(storedSectionId).toStrictEqual("section2");
  });

  it("confirm dialog appears", () => {
    renderComponent();
    expect(confirmYesButton()).toBeNull();

    click(uploadButton());
    expect(confirmYesButton()).not.toBeNull();
  });

  it("confirm upload cancel", () => {
    renderComponent();
    click(uploadButton());
    renderComponent();

    click(confirmNoButton());
    renderComponent();

    expect(confirmYesButton()).toBeNull();
    expect(uploadResults).not.toHaveBeenCalled();
  });

  it("confirm upload cancel click background", () => {
    renderComponent();
    click(uploadButton());
    renderComponent();

    click(backdrop());
    renderComponent();

    expect(confirmYesButton()).toBeNull();
    expect(uploadResults).not.toHaveBeenCalled();
  });

  it("upload success and close", () => {
    renderComponent();
    expect(uploadResults).toHaveBeenCalledTimes(0);
    click(uploadButton());
    renderComponent();
    click(confirmYesButton());
    renderComponent();

    const { setSubmitState, setProgressValue } = checkUploadAndGetCallbacks(
      INPUT_STATE,
      TEST_ENDPOINT
    );

    act(() => {
      setSubmitState(SUBMIT_COMPLETE);
      setProgressValue(100);
    });

    checkDialogComplete();

    click(closeButton());

    renderComponent();
    expect(dialog()).toBeNull();
    expect(surveyStore.getState()).toStrictEqual({
      ...EMPTY_STATE,
      initialisingState: false,
    });
  });

  it("upload failure and close", () => {
    renderComponent();
    expect(uploadResults).toHaveBeenCalledTimes(0);
    click(uploadButton());
    renderComponent();
    click(confirmYesButton());
    renderComponent();

    const { setSubmitState, setProgressValue } = checkUploadAndGetCallbacks(
      INPUT_STATE,
      TEST_ENDPOINT
    );

    act(() => {
      setSubmitState(SUBMIT_FAILED);
      setProgressValue(50);
    });

    checkDialogFailed("50%");

    click(closeButton());

    renderComponent();
    expect(dialog()).toBeNull();
    expect(surveyStore.getState()).toStrictEqual(INPUT_STATE);
  });

  it("progress changes during upload", () => {
    renderComponent();
    expect(uploadResults).toHaveBeenCalledTimes(0);
    click(uploadButton());
    renderComponent();
    click(confirmYesButton());
    renderComponent();

    const { setSubmitState, setProgressValue } = checkUploadAndGetCallbacks(
      INPUT_STATE,
      TEST_ENDPOINT
    );

    // Test progress updates
    act(() => {
      setSubmitState(SUBMITTING_START);
      setProgressValue(0);
    });
    checkDialogInProgress("0%", "Uploading survey response");

    act(() => {
      setSubmitState(SUBMITTING_PHOTOS);
      setProgressValue(20);
    });
    checkDialogInProgress("20%", "Uploading photos");

    act(() => {
      setProgressValue(40);
    });
    checkDialogInProgress("40%", "Uploading photos");

    act(() => {
      setProgressValue(60);
    });
    checkDialogInProgress("60%", "Uploading photos");

    act(() => {
      setSubmitState(SUBMITTING_CONFIRM);
      setProgressValue(80);
    });
    checkDialogInProgress("80%", "Confirming upload");

    act(() => {
      setSubmitState(SUBMIT_COMPLETE);
      setProgressValue(100);
    });
    checkDialogComplete();
  });

  function checkUploadAndGetCallbacks(expectedState, expectedEndpoint) {
    expect(uploadResults).toHaveBeenCalledTimes(1);
    const calls = uploadResults.mock.calls;
    expect(calls[0]).toHaveLength(4);
    expect(calls[0][2]).toStrictEqual(expectedState);
    expect(calls[0][3]).toStrictEqual(expectedEndpoint);
    return {
      setSubmitState: calls[0][0],
      setProgressValue: calls[0][1],
    };
  }

  function checkDialogInProgress(progress, status) {
    // check dialog state
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

  const sectionContent = () =>
    container.querySelector(".section .submit-content");
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
  const confirmYesButton = () => document.querySelector(".dialog #yes-button");
  const confirmNoButton = () => document.querySelector(".dialog #no-button");
  const backdrop = () =>
    document.querySelector("#dialog-container div:first-child");

  function progressBarValue() {
    const styleValue = progressBar().getAttribute("style");
    return styleValue.substring(7, styleValue.length - 1);
  }

  function click(element) {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
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
});
