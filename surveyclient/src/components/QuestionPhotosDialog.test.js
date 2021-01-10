/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import QuestionPhotosDialog from "./QuestionPhotosDialog";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import {
  RESET_STATE,
  ADD_PHOTO,
  UPDATE_PHOTO_DESCRIPTION,
} from "../model/ActionTypes";

var closeDialogHasBeenCalled = false;
function closeDialog() {
  closeDialogHasBeenCalled = true;
}

describe("component QuestionPhotosDialog", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    surveyStore.dispatch({ type: RESET_STATE });
    closeDialogHasBeenCalled = false;
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  const SECTION_ID = "learning";
  const QUESTION_ID = "classroom";
  const QUESTION_NUMBER = 17;
  const QUESTION_TEXT = "test question text";

  it("initial empty state", () => {
    renderComponent();

    expect(questionLine().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT + "Selectphotoadd photo"
    );
    expect(photoContainers()).toHaveLength(0);
  });

  it("initial state with photos", () => {
    surveyStore.dispatch({
      type: ADD_PHOTO,
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      imageData: "new imageData1",
    });
    const photoUuid1 = Object.keys(surveyStore.getState().photoDetails)[0];
    surveyStore.dispatch({
      type: ADD_PHOTO,
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      imageData: "new imageData2",
    });
    surveyStore.dispatch({
      type: UPDATE_PHOTO_DESCRIPTION,
      photoId: photoUuid1,
      description: "new description1",
    });

    renderComponent();

    expect(questionLine().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT + "Selectphotoadd photo"
    );
    expect(photoContainers()).toHaveLength(2);
    expect(photoDescriptions()).toStrictEqual(["new description1", ""]);
    expect(photoData()).toStrictEqual([
      "data:image/jpeg;base64,new imageData1",
      "data:image/jpeg;base64,new imageData2",
    ]);
  });

  it("add photo", async () => {
    renderComponent();
    expect(photoContainers()).toHaveLength(0);
    const imageData = "new imageData3";
    const imageDataBase64 = btoa(imageData);

    const file = new Blob(["new imageData3"], {
      type: "mimeType",
    });
    // Create a fake target as JS really doesn't like creating FileLists arbitrarily
    const target = document.createElement("div");
    target.blur = jest.fn();
    target.files = [file];

    Simulate.change(addPhotoButton(), { target: target });
    // Not a fan of sleeps, but indirect async waiting doesn't work
    await sleep(2000);

    renderComponent();
    expect(photoContainers()).toHaveLength(1);
    expect(photoDescriptions()).toStrictEqual([""]);
    expect(photoData()).toStrictEqual([
      "data:image/jpeg;base64," + imageDataBase64,
    ]);

    // Check value in model
    expect(Object.keys(surveyStore.getState().photos)).toHaveLength(1);
    const photoUuid = Object.keys(surveyStore.getState().photoDetails)[0];
    expect(surveyStore.getState().photos[photoUuid]).toStrictEqual({
      imageData: imageDataBase64,
    });
    expect(surveyStore.getState().photoDetails[photoUuid]).toStrictEqual({
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      description: "",
    });
  });

  it("close dialog", () => {
    renderComponent();
    expect(closeDialogHasBeenCalled).toStrictEqual(false);

    clickCloseButton();

    expect(closeDialogHasBeenCalled).toStrictEqual(true);
  });

  it("close dialog - click outside dialog", () => {
    renderComponent();
    expect(closeDialogHasBeenCalled).toStrictEqual(false);

    clickOutsideDialog();

    expect(closeDialogHasBeenCalled).toStrictEqual(true);
  });

  const photoContainers = () =>
    document.querySelectorAll(".dialog .photo-container");
  const photoDescriptions = () => {
    const nodelist = document.querySelectorAll(
      ".dialog .photo-container .photo-description"
    );
    return [...nodelist].map((element) => element.value);
  };
  const photoData = () => {
    const nodelist = document.querySelectorAll(
      ".dialog .photo-container .photo"
    );
    return [...nodelist].map((element) => element.src);
  };
  const closeButton = () => document.querySelector(".dialog .close-button");
  const addPhotoButton = () =>
    document.querySelector(".dialog .question-line input");
  const backdrop = () =>
    document.querySelector("#dialog-container div:first-child");
  const questionLine = () => document.querySelector(".dialog .question-line");

  function clickCloseButton() {
    closeButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function clickOutsideDialog() {
    backdrop().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <QuestionPhotosDialog
            sectionId={SECTION_ID}
            questionId={QUESTION_ID}
            questionText={QUESTION_TEXT}
            questionNumber={QUESTION_NUMBER}
            closeDialog={closeDialog}
          />
        </Provider>,
        container
      );
    });
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
});
