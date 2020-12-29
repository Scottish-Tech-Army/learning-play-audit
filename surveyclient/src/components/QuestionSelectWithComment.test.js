/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedOption"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import QuestionSelectWithComment from "./QuestionSelectWithComment";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { RESET_STATE } from "../model/ActionTypes";

describe("component QuestionSelectWithComment", () => {
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
  const QUESTION = {
    id: QUESTION_ID,
    text: QUESTION_TEXT,
  };

  it("initial empty state", () => {
    renderComponent();

    expect(questionLine().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT
    );
    checkSelectedOption(null);
  });

  it("selection options", () => {
    renderComponent();
    checkSelectedOption(null);

    selectOption("a");
    checkSelectedOption("a");

    selectOption("b");
    checkSelectedOption("b");

    selectOption("c");
    checkSelectedOption("c");

    selectOption("d");
    checkSelectedOption("d");

    selectOption("a");
    checkSelectedOption("a");

    // Test unselection
    selectOption("a");
    checkSelectedOption(null);
  });

  const questionLine = () => container.querySelector(".question-line");
  const toggleButtons = () =>
    container.querySelectorAll(".toggle-button-group button");
  const toggleButton = (id) =>
    container.querySelector(".toggle-button-group button#" + id);

  function checkSelectedOption(expectedOption) {
    // Check visible selection
    const buttons = toggleButtons();
    expect(buttons).toHaveLength(4);
    buttons.forEach((button) => {
      if (button.getAttribute("id") === expectedOption) {
        expect(button.getAttribute("class")).toContain("selected");
      } else {
        expect(button.getAttribute("class")).not.toContain("selected");
      }
    });

    // Check value in model
    expect(
      surveyStore.getState().answers[SECTION_ID][QUESTION_ID].answer
    ).toStrictEqual(expectedOption ? expectedOption : "");
  }

  function selectOption(option) {
    toggleButton(option).dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <QuestionSelectWithComment
            sectionId={SECTION_ID}
            question={QUESTION}
            questionNumber={QUESTION_NUMBER}
          />
        </Provider>,
        container
      );
    });
  }
});
