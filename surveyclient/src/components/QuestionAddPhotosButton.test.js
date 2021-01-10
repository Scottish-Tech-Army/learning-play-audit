/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import QuestionAddPhotosButton from "./QuestionAddPhotosButton";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import {
  RESET_STATE,
  ADD_PHOTO,
  UPDATE_PHOTO_DESCRIPTION,
} from "../model/ActionTypes";

describe("component QuestionAddPhotosButton", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    surveyStore.dispatch({ type: RESET_STATE });
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

  it("initial state - no photos", () => {
    renderComponent();

    expect(buttonImagePhotoCount()).toBeNull();
  });

  it("initial state - undefined photoDetails", () => {
    delete surveyStore.getState().photoDetails;
    renderComponent();

    expect(buttonImagePhotoCount()).toBeNull();
  });

  it("initial state - with photos", () => {
    addTestPhotos();
    renderComponent();

    expect(buttonImagePhotoCount().textContent).toStrictEqual("2");
  });

  it("popup dialog - no photos", () => {
    renderComponent();

    clickAddPhotosButton();

    expect(questionLine().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT + "Selectphotoadd photo"
    );
    expect(photoContainers()).toHaveLength(0);
  });

  it("popup dialog - with photos", () => {
    addTestPhotos();
    renderComponent();

    clickAddPhotosButton();

    expect(questionLine().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT + "Selectphotoadd photo"
    );
    expect(photoContainers()).toHaveLength(2);
  });

  it("close dialog", () => {
    renderComponent();
    clickAddPhotosButton();
    expect(questionLine().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT + "Selectphotoadd photo"
    );

    clickCloseButton();
    expect(questionLine()).toBeNull();
  });

  const buttonImagePhotoCount = () =>
    container.querySelector(".add-photo-icon text");
  const addPhotosButton = () => container.querySelector(".add-photos-button");
  const closeButton = () => document.querySelector(".dialog .close-button");
  const questionLine = () => document.querySelector(".dialog .question-line");
  const photoContainers = () =>
    document.querySelectorAll(".dialog .photo-container");

  function clickAddPhotosButton() {
    addPhotosButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
  function clickCloseButton() {
    closeButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function addTestPhotos() {
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
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <QuestionAddPhotosButton
            sectionId={SECTION_ID}
            questionId={QUESTION_ID}
            questionText={QUESTION_TEXT}
            questionNumber={QUESTION_NUMBER}
          />
        </Provider>,
        container
      );
    });
  }
});
