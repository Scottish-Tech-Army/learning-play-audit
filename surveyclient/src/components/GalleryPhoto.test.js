/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkDescriptionValue"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import GalleryPhoto from "./GalleryPhoto";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import {
  RESET_STATE,
  ADD_PHOTO,
  UPDATE_PHOTO_DESCRIPTION,
} from "../model/ActionTypes";

var photoId = null;

describe("component GalleryPhoto", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    surveyStore.dispatch({ type: RESET_STATE });

    surveyStore.dispatch({
      type: ADD_PHOTO,
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      imageData: "new imageData1",
    });
    photoId = Object.keys(surveyStore.getState().photoDetails)[0];
    surveyStore.dispatch({
      type: ADD_PHOTO,
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      imageData: "new imageData2",
    });
    surveyStore.dispatch({
      type: UPDATE_PHOTO_DESCRIPTION,
      photoId: photoId,
      description: "new description1",
    });
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  const SECTION_ID = "learning";
  const QUESTION_ID = "classroom";

  it("initial state", () => {
    renderComponent();

    checkDescriptionValue("new description1");
    expect(photoData()).toStrictEqual("data:image/jpeg;base64,new imageData1");
  });

  it("initial state - missing photo", () => {
    delete surveyStore.getState().photos[photoId];

    renderComponent();

    expect(photoContainer()).toHaveTextContent("Photo not found");
  });

  it("initial state - missing photoDetails", () => {
    delete surveyStore.getState().photoDetails[photoId];

    renderComponent();

    expect(photoContainer()).toHaveTextContent("Photo not found");
  });

  it("delete photo", async () => {
    renderComponent();
    expect(Object.keys(surveyStore.getState().photos)).toHaveLength(2);
    expect(Object.keys(surveyStore.getState().photoDetails)).toHaveLength(2);
    expect(surveyStore.getState().photos[photoId]).toStrictEqual({
      imageData: "new imageData1",
    });
    expect(surveyStore.getState().photoDetails[photoId]).toStrictEqual({
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      description: "new description1",
    });

    clickDeleteButton();

    expect(Object.keys(surveyStore.getState().photos)).toHaveLength(1);
    expect(Object.keys(surveyStore.getState().photoDetails)).toHaveLength(1);
    expect(surveyStore.getState().photos[photoId]).toBeUndefined();
    expect(surveyStore.getState().photoDetails[photoId]).toBeUndefined();
  });

  it("set description", () => {
    renderComponent();
    checkDescriptionValue("new description1");

    setDescription("test value");
    renderComponent();
    checkDescriptionValue("test value");

    setDescription("");
    renderComponent();
    checkDescriptionValue("");
  });


  const photoContainer = () => document.querySelector(".photo-container");
  const photoData = () => document.querySelector(".photo").src;
  const descriptionField = () => document.querySelector(".photo-container textarea");
  const deleteButton = () => document.querySelector(".delete-button");

  function checkDescriptionValue(expectedValue) {
    expect(descriptionField().textContent).toStrictEqual(expectedValue);

    // Check value in model
    expect(
      surveyStore.getState().photoDetails[photoId].description
    ).toStrictEqual(expectedValue);
  }

  function clickDeleteButton() {
    deleteButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }


  function setDescription(value) {
    const element = descriptionField();
    element.value = value;
    Simulate.change(element);
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <GalleryPhoto photoId={photoId} />
        </Provider>,
        container
      );
    });
  }
});
