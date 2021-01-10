/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import QuestionAddCommentButton from "./QuestionAddCommentButton";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { RESET_STATE, SET_ANSWER } from "../model/ActionTypes";

describe("component QuestionAddCommentButton", () => {
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

  const IMAGE_NO_COMMENT = "add_note.svg";
  const IMAGE_WITH_COMMENT = "add_note_ticked.svg";

  it("initial state - no comment", () => {
    renderComponent();

    expect(buttonImage().src).toContain(IMAGE_NO_COMMENT);
  });

  it("initial state - with comment", () => {
    surveyStore.dispatch({
      type: SET_ANSWER,
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      field: "comments",
      value: "test value",
    });
    renderComponent();

    expect(buttonImage().src).toContain(IMAGE_WITH_COMMENT);
  });

  it("popup dialog - no comment", () => {
    renderComponent();

    clickAddCommentButton();

    expect(questionLine().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT
    );
    checkCommentValue("");
  });

  it("popup dialog - with comment", () => {
    surveyStore.dispatch({
      type: SET_ANSWER,
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      field: "comments",
      value: "test value",
    });
    renderComponent();

    clickAddCommentButton();

    expect(questionLine().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT
    );
    checkCommentValue("test value");
  });

  it("close dialog", () => {
    renderComponent();
    clickAddCommentButton();
    expect(questionLine().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT
    );

    clickCloseButton();
    expect(questionLine()).toBeNull();
  });

  const buttonImage = () => container.querySelector(".add-note-button img");
  const addCommentButton = () => container.querySelector(".add-note-button");
  const closeButton = () => document.querySelector(".dialog .save-note-button");
  const questionLine = () => document.querySelector(".dialog .question-line");
  const commentField = () => document.querySelector(".dialog textarea");

  function checkCommentValue(expectedValue) {
    expect(commentField().textContent).toStrictEqual(expectedValue);

    // Check value in model
    expect(
      surveyStore.getState().answers[SECTION_ID][QUESTION_ID].comments
    ).toStrictEqual(expectedValue);
  }

  function clickAddCommentButton() {
    addCommentButton().dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
  }
  function clickCloseButton() {
    closeButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <QuestionAddCommentButton
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
