/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import QuestionCommentDialog from "./QuestionCommentDialog";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { RESET_STATE, SET_ANSWER } from "../model/ActionTypes";

var closeDialogHasBeenCalled = false;
function closeDialog() {
  closeDialogHasBeenCalled = true;
}

describe("component QuestionCommentDialog", () => {
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
      QUESTION_NUMBER + QUESTION_TEXT
    );
    checkCommentValue("");
  });

  it("set comment", () => {
    renderComponent();
    checkCommentValue("");
    expect(closeDialogHasBeenCalled).toStrictEqual(false);

    setComment("test value");
    clickCloseButton();

    checkCommentValue("test value");
    expect(closeDialogHasBeenCalled).toStrictEqual(true);
  });

  it("cancel comment", () => {
    renderComponent();
    checkCommentValue("");
    expect(closeDialogHasBeenCalled).toStrictEqual(false);

    setComment("test value");
    clickOutsideDialog();

    expect(commentField().textContent).toStrictEqual("test value");

    // Check value in model
    expect(
      surveyStore.getState().answers[SECTION_ID][QUESTION_ID].comments
    ).toStrictEqual("");
    expect(closeDialogHasBeenCalled).toStrictEqual(true);
  });

  it("clear comment", () => {
    surveyStore.dispatch({
      type: SET_ANSWER,
      sectionId: "learning",
      questionId: "classroom",
      field: "comments",
      value: "test value",
    });
    renderComponent();
    checkCommentValue("test value");
    expect(closeDialogHasBeenCalled).toStrictEqual(false);

    setComment("");
    clickCloseButton();
    checkCommentValue("");
    expect(closeDialogHasBeenCalled).toStrictEqual(true);
  });

  const commentField = () => document.querySelector(".dialog textarea");
  const closeButton = () => document.querySelector(".dialog .save-note-button");
  const backdrop = () =>
    document.querySelector("#dialog-container div:first-child");
  const questionLine = () => document.querySelector(".dialog .question-line");

  function checkCommentValue(expectedValue) {
    expect(commentField().textContent).toStrictEqual(expectedValue);

    // Check value in model
    expect(
      surveyStore.getState().answers[SECTION_ID][QUESTION_ID].comments
    ).toStrictEqual(expectedValue);
  }

  function clickCloseButton() {
    closeButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function clickOutsideDialog() {
    backdrop().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function setComment(value) {
    const element = commentField();
    element.value = value;
    Simulate.change(element);
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <QuestionCommentDialog
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
});
