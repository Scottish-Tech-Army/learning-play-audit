/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import QuestionPhotosDialog from "./QuestionPhotosDialog";
import { surveyStore } from "../model/SurveyModel";
import { ADD_PHOTO, UPDATE_PHOTO_DESCRIPTION } from "../model/ActionTypes";
import { renderWithStore } from "./ReactTestUtils";
import { waitFor } from "@testing-library/dom";
import getPhotoUuid from "../model/SurveyPhotoUuid";

const closeDialog = jest.fn();

describe("component QuestionPhotosDialog", () => {
  const SECTION_ID = "learning";
  const QUESTION_ID = "classroom";
  const QUESTION_NUMBER = 17;
  const QUESTION_TEXT = "test question text";

  beforeEach(() => {
    (getPhotoUuid as jest.Mock).mockImplementation(() => "FIXED_UUID_1");
  });

  it("initial empty state", () => {
    renderWithStore(
      <QuestionPhotosDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );

    expect(questionLine()).toHaveTextContent(
      QUESTION_NUMBER + QUESTION_TEXT + "Selectphotoadd photo"
    );
    expect(photoContainers()).toHaveLength(0);
  });

  it("initial state with photos", () => {
    (getPhotoUuid as jest.Mock)
      .mockImplementationOnce(() => "FIXED_UUID_1")
      .mockImplementationOnce(() => "FIXED_UUID_2");

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
      photoId: "FIXED_UUID_1",
      description: "new description1",
    });

    renderWithStore(
      <QuestionPhotosDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );

    expect(questionLine()).toHaveTextContent(
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
    const { user } = renderWithStore(
      <QuestionPhotosDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );
    expect(photoContainers()).toHaveLength(0);
    const imageData = "new imageData3";
    const imageDataBase64 = Buffer.from(imageData).toString("base64");

    (getPhotoUuid as jest.Mock).mockImplementation(() => "newPhoto1");

    await user.upload(addPhotoButton()!, [
      new File([imageData], `file1`, { type: "image/jpg" }),
    ]);
    await waitFor(() => expect(photoContainers()).toHaveLength(1));
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
    const { user } = renderWithStore(
      <QuestionPhotosDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );
    expect(confirmButton()).toBeNull();

    (getPhotoUuid as jest.Mock).mockImplementation(() => "newPhoto1");

    await user.upload(addPhotoButton()!, [
      new File(["new imageData3"], `file1`, { type: "image/jpg" }),
    ]);
    expect(confirmButton()).not.toBeNull();
    await user.click(confirmButton()!);

    expect(confirmButton()).toBeNull();
    expect(closeDialog).not.toHaveBeenCalled();
  });

  it("add photo and click backdrop", async () => {
    const { user } = renderWithStore(
      <QuestionPhotosDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );
    expect(photoContainers()).toHaveLength(0);
    expect(confirmButton()).toBeNull();

    (getPhotoUuid as jest.Mock).mockImplementation(() => "newPhoto1");

    await user.upload(addPhotoButton()!, [
      new File(["new imageData3"], `file1`, { type: "image/jpg" }),
    ]);
    await waitFor(() => expect(confirmButton()).not.toBeNull());

    const confirmBackdrop = document.querySelector(
      "#confirm-dialog-container div:first-child"
    )!;
    await user.click(confirmBackdrop);

    expect(confirmButton()).toBeNull();
    expect(closeDialog).not.toHaveBeenCalled();
  });

  it("add multiple photos", async () => {
    const { user } = renderWithStore(
      <QuestionPhotosDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );
    expect(photoContainers()).toHaveLength(0);
    const imageData1 = "new imageData1";
    const imageData2 = "new imageData2";
    const imageData1Base64 = Buffer.from(imageData1).toString("base64");
    const imageData2Base64 = Buffer.from(imageData2).toString("base64");

    (getPhotoUuid as jest.Mock)
      .mockImplementationOnce(() => "newPhoto1")
      .mockImplementationOnce(() => "newPhoto2");

    await user.upload(addPhotoButton()!, [
      new File([imageData1], `file1`, { type: "image/jpg" }),
      new File([imageData2], `file2`, { type: "image/jpg" }),
    ]);

    await waitFor(() => expect(photoContainers()).toHaveLength(2));
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

  it("close dialog", async () => {
    const { user } = renderWithStore(
      <QuestionPhotosDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );
    expect(closeDialog).not.toHaveBeenCalled();

    await user.click(closeButton()!);

    expect(closeDialog).toHaveBeenCalledTimes(1);
  });

  it("close dialog - click outside dialog", async () => {
    const { user } = renderWithStore(
      <QuestionPhotosDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );
    expect(closeDialog).not.toHaveBeenCalled();

    const backdrop = document.querySelector(
      "#dialog-container div:first-child"
    )!;
    await user.click(backdrop);

    expect(closeDialog).toHaveBeenCalledTimes(1);
  });

  const photoContainers = () =>
    document.querySelectorAll(".dialog .photo-container");
  const photoDescriptions = () => {
    const nodelist = document.querySelectorAll(
      ".dialog .photo-container .photo-description"
    );
    return Array.from(nodelist).map((element) => element.textContent);
  };
  const photoData = () => {
    const nodelist = document.querySelectorAll(
      ".dialog .photo-container .photo"
    );
    return Array.from(nodelist).map((element) => element.getAttribute("src"));
  };
  const closeButton = () => document.querySelector(".dialog .close-button");
  const addPhotoButton = () =>
    document.querySelector(".dialog .question-line input") as HTMLInputElement;
  const questionLine = () => document.querySelector(".dialog .question-line");
  const confirmButton = () => document.querySelector(".dialog #ok-button");
});
