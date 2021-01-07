/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import { uploadResults } from "../model/SubmitAction";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import SubmitSection from "./SubmitSection";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { REFRESH_STATE, SET_AUTH_STATE } from "../model/ActionTypes";
import { SUBMIT } from "./FixedSectionTypes";
import { SIGNED_IN, SIGNED_OUT } from "../model/AuthStates";
import { INPUT_STATE } from "../model/TestUtils";
import {
  SUBMITTING_START,
  SUBMITTING_PHOTOS,
  SUBMITTING_CONFIRM,
  SUBMIT_COMPLETE,
  SUBMIT_FAILED,
} from "../model/SubmitStates";

const TEST_ENDPOINT = "http://localhost:9999/testEndpoint";

jest.mock("../model/SubmitAction");
jest.mock("@aws-amplify/auth");

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
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });

    uploadResults.mockReset();
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial state logged in", () => {
    // Default test data is signed in - just making sure
    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_IN,
      user: { attributes: { email: "test@example.com" } },
    });
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

  it("upload success and close", () => {
    renderComponent();
    expect(uploadResults).toHaveBeenCalledTimes(0);
    clickUploadButton();

    const { setSubmitState, setProgressValue } = checkUploadAndGetCallbacks(
      INPUT_STATE,
      TEST_ENDPOINT
    );

    act(() => {
      setSubmitState(SUBMIT_COMPLETE);
      setProgressValue(100);
    });

    checkDialogComplete();

    clickCloseButton();

    renderComponent();
    expect(dialog()).toBeNull();
  });

  it("upload failure and close", () => {
    renderComponent();
    expect(uploadResults).toHaveBeenCalledTimes(0);
    clickUploadButton();

    const { setSubmitState, setProgressValue } = checkUploadAndGetCallbacks(
      INPUT_STATE,
      TEST_ENDPOINT
    );

    act(() => {
      setSubmitState(SUBMIT_FAILED);
      setProgressValue(50);
    });

    checkDialogFailed("50%");

    clickCloseButton();

    renderComponent();
    expect(dialog()).toBeNull();
  });

  it("progress changes during upload", () => {
    renderComponent();
    expect(uploadResults).toHaveBeenCalledTimes(0);
    clickUploadButton();

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
    uploadButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
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
