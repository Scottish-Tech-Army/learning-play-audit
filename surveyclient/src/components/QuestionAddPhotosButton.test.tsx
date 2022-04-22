/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import QuestionAddPhotosButton from "./QuestionAddPhotosButton";
import { surveyStore } from "../model/SurveyModel";
import { ADD_PHOTO, UPDATE_PHOTO_DESCRIPTION } from "../model/ActionTypes";
import { renderWithStore } from "./ReactTestUtils";
import getPhotoUuid from "../model/SurveyPhotoUuid";

describe("component QuestionAddPhotosButton", () => {
  const SECTION_ID = "learning";
  const QUESTION_ID = "classroom";
  const QUESTION_NUMBER = 17;
  const QUESTION_TEXT = "test question text";

  it("initial state - no photos", () => {
    renderWithStore(
      <QuestionAddPhotosButton
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
      />
    );

    expect(buttonImagePhotoCount()).toBeNull();
  });

  it("initial state - with photos", () => {
    addTestPhotos();
    renderWithStore(
      <QuestionAddPhotosButton
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
      />
    );

    expect(buttonImagePhotoCount()).toHaveTextContent("2");
  });

  it("popup dialog - no photos", async () => {
    const { user } = renderWithStore(
      <QuestionAddPhotosButton
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
      />
    );

    await user.click(addPhotosButton());

    expect(questionLine()).toHaveTextContent(
      QUESTION_NUMBER + QUESTION_TEXT + "Selectphotoadd photo"
    );
    expect(photoContainers()).toHaveLength(0);
  });

  it("popup dialog - with photos", async () => {
    addTestPhotos();
    const { user } = renderWithStore(
      <QuestionAddPhotosButton
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
      />
    );

    await user.click(addPhotosButton());

    expect(questionLine()).toHaveTextContent(
      QUESTION_NUMBER + QUESTION_TEXT + "Selectphotoadd photo"
    );
    expect(photoContainers()).toHaveLength(2);
  });

  it("close dialog", async () => {
    const { user } = renderWithStore(
      <QuestionAddPhotosButton
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
      />
    );
    await user.click(addPhotosButton());
    expect(questionLine()).toHaveTextContent(
      QUESTION_NUMBER + QUESTION_TEXT + "Selectphotoadd photo"
    );

    await user.click(closeButton());
    expect(questionLine()).toBeNull();
  });

  const buttonImagePhotoCount = () =>
    document.querySelector(".add-photo-icon text");
  const addPhotosButton = () => document.querySelector(".add-photos-button")!;
  const closeButton = () => document.querySelector(".dialog .close-button")!;
  const questionLine = () => document.querySelector(".dialog .question-line");
  const photoContainers = () =>
    document.querySelectorAll(".dialog .photo-container");

  function addTestPhotos() {
    (getPhotoUuid as jest.Mock)
      .mockImplementationOnce(() => "testPhoto1")
      .mockImplementationOnce(() => "testPhoto2");

    surveyStore.dispatch({
      type: ADD_PHOTO,
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      imageData: "new imageData1",
    });
    surveyStore.dispatch({
      type: ADD_PHOTO,
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      imageData: "new imageData2",
    });
    surveyStore.dispatch({
      type: UPDATE_PHOTO_DESCRIPTION,
      photoId: "testPhoto1",
      description: "new description1",
    });
  }
});
