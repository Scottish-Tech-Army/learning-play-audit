import React from "react";
import GalleryPhoto from "./GalleryPhoto";
import { surveyStore } from "../model/SurveyModel";
import { ADD_PHOTO, UPDATE_PHOTO_DESCRIPTION } from "../model/ActionTypes";
import { renderWithStore } from "./ReactTestUtils";
import getPhotoUuid from "../model/SurveyPhotoUuid";

const PHOTO_ID_1 = "FIXED_UUID_1";

describe("component GalleryPhoto", () => {
  beforeEach(() => {
    (getPhotoUuid as jest.Mock)
      .mockImplementationOnce(() => PHOTO_ID_1)
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
      photoId: PHOTO_ID_1,
      description: "new description1",
    });
  });

  const SECTION_ID = "learning";
  const QUESTION_ID = "classroom";

  it("initial state", () => {
    const { getByRole } = renderWithStore(
      <GalleryPhoto photoId={PHOTO_ID_1} />
    );

    expect(
      getByRole("textbox", { name: "Photo description" })
    ).toHaveTextContent("new description1");

    expect(getByRole("img")).toHaveAttribute(
      "src",
      "data:image/jpeg;base64,new imageData1"
    );
  });

  it("initial state - missing photo", () => {
    delete surveyStore.getState().photos[PHOTO_ID_1];

    const { container } = renderWithStore(
      <GalleryPhoto photoId={PHOTO_ID_1} />
    );

    expect(container).toHaveTextContent("Photo not found");
  });

  it("initial state - missing photoDetails", () => {
    delete surveyStore.getState().photoDetails[PHOTO_ID_1];

    const { container } = renderWithStore(
      <GalleryPhoto photoId={PHOTO_ID_1} />
    );

    expect(container).toHaveTextContent("Photo not found");
  });

  it("delete photo", async () => {
    const { getByRole, user } = renderWithStore(
      <GalleryPhoto photoId={PHOTO_ID_1} />
    );
    expect(Object.keys(surveyStore.getState().photos)).toHaveLength(2);
    expect(Object.keys(surveyStore.getState().photoDetails)).toHaveLength(2);
    expect(surveyStore.getState().photos[PHOTO_ID_1]).toStrictEqual({
      imageData: "new imageData1",
    });
    expect(surveyStore.getState().photoDetails[PHOTO_ID_1]).toStrictEqual({
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      description: "new description1",
    });

    await user.click(getByRole("button", { name: "Delete Photo" }));

    expect(Object.keys(surveyStore.getState().photos)).toHaveLength(1);
    expect(Object.keys(surveyStore.getState().photoDetails)).toHaveLength(1);
    expect(surveyStore.getState().photos[PHOTO_ID_1]).toBeUndefined();
    expect(surveyStore.getState().photoDetails[PHOTO_ID_1]).toBeUndefined();
  });

  it("set description", async () => {
    const { getByRole, user } = renderWithStore(
      <GalleryPhoto photoId={PHOTO_ID_1} />
    );

    await user.clear(getByRole("textbox", { name: "Photo description" }));
    await user.type(
      getByRole("textbox", { name: "Photo description" }),
      "test value"
    );
    expect(surveyStore.getState().photoDetails[PHOTO_ID_1].description).toBe(
      "test value"
    );

    await user.clear(getByRole("textbox", { name: "Photo description" }));
    expect(surveyStore.getState().photoDetails[PHOTO_ID_1].description).toBe(
      ""
    );
  });
});
