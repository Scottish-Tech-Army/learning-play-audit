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
    const imageDataBase64 = Buffer.from(imageData).toString("base64");

    await addPhotoInput(imageData);
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

  it("add photo and click confirm", async () => {
    renderComponent();
    expect(confirmButton()).toBeNull();

    await addPhotoInput("new imageData3");
    expect(confirmButton()).not.toBeNull();
    click(confirmButton());
    renderComponent();

    expect(confirmButton()).toBeNull();
    expect(closeDialogHasBeenCalled).toStrictEqual(false);
  });

  it("add photo and click backdrop", async () => {
    renderComponent();
    expect(photoContainers()).toHaveLength(0);
    expect(confirmButton()).toBeNull();

    await addPhotoInput("new imageData3");
    expect(confirmButton()).not.toBeNull();
    click(confirmBackdrop());
    renderComponent();

    expect(confirmButton()).toBeNull();
    expect(closeDialogHasBeenCalled).toStrictEqual(false);
  });

  it("add multiple photos", async () => {
    renderComponent();
    expect(photoContainers()).toHaveLength(0);
    const imageData1 = "new imageData1";
    const imageData2 = "new imageData2";
    const imageData1Base64 = Buffer.from("image data1").toString("base64");
    const imageData2Base64 = Buffer.from(imageData2).toString("base64");

    await addPhotoInput(imageData1, imageData2);
    expect(photoContainers()).toHaveLength(2);
    expect(photoDescriptions()).toStrictEqual(["", ""]);
    expect(photoData()).toStrictEqual([
      "data:image/jpeg;base64," + imageData1Base64,
      "data:image/jpeg;base64," + imageData2Base64,
    ]);

    // Check value in model
    expect(Object.keys(surveyStore.getState().photos)).toHaveLength(2);
    const photoUuid1 = Object.keys(surveyStore.getState().photoDetails)[0];
    expect(surveyStore.getState().photos[photoUuid1]).toStrictEqual({
      imageData: imageData1Base64,
    });
    expect(surveyStore.getState().photoDetails[photoUuid1]).toStrictEqual({
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      description: "",
    });
    const photoUuid2 = Object.keys(surveyStore.getState().photoDetails)[1];
    expect(surveyStore.getState().photos[photoUuid2]).toStrictEqual({
      imageData: imageData2Base64,
    });
    expect(surveyStore.getState().photoDetails[photoUuid2]).toStrictEqual({
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      description: "",
    });
  });

  it("close dialog", () => {
    renderComponent();
    expect(closeDialogHasBeenCalled).toStrictEqual(false);

    click(closeButton());

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
  const confirmBackdrop = () =>
    document.querySelector("#confirm-dialog-container div:first-child");
  const questionLine = () => document.querySelector(".dialog .question-line");
  const confirmButton = () => document.querySelector(".dialog #ok-button");

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function clickOutsideDialog() {
    backdrop().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  async function addPhotoInput(...fileData) {
    const files = fileData.map(
      (data) => new Blob([data], { type: "mimeType" })
    );
    // Create a fake target as JS really doesn't like creating FileLists arbitrarily
    const target = document.createElement("div");
    target.blur = jest.fn();
    target.files = files;

    Simulate.change(addPhotoButton(), { target: target });
    // Not a fan of sleeps, but indirect async waiting doesn't work
    await sleep(2000);
    renderComponent();
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
