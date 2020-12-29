/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedOption", "checkCommentValue"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import QuestionUserSelect from "./QuestionUserSelect";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { RESET_STATE } from "../model/ActionTypes";

describe("component QuestionUserSelect", () => {
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

  const SECTION_ID = "background";
  const QUESTION_ID = "position";
  const QUESTION = { id: QUESTION_ID };

  it("initial empty state", () => {
    renderComponent();

    checkSelectedOption(null);
    checkCommentLabel("Details");
  });

  it("selection options", () => {
    renderComponent();
    checkSelectedOption(null);
    checkCommentLabel("Details");

    // Teacher
    selectOption("a");
    checkSelectedOption("a");
    checkCommentLabel("Position");

    // Parent
    selectOption("b");
    checkSelectedOption("b");
    checkCommentLabel("Details");

    // Pupil
    selectOption("c");
    checkSelectedOption("c");
    checkCommentLabel("Year group");

    // Other
    selectOption("d");
    checkSelectedOption("d");
    checkCommentLabel("Details");

    selectOption("a");
    checkSelectedOption("a");
    checkCommentLabel("Position");

    // Test unselection
    selectOption("a");
    checkSelectedOption("");
    checkCommentLabel("Details");
  });

  it("set comment", () => {
    renderComponent();
    checkCommentValue("");

    setComment("test value");
    checkCommentValue("test value");

    setComment("");
    checkCommentValue("");
  });

  const commentLabel = () =>
    container.querySelector(".question .details-column label");
  const commentField = () =>
    container.querySelector(".question .details-column input");
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

  function checkCommentLabel(expectedValue) {
    expect(commentLabel()).toHaveTextContent(expectedValue);
  }

  function checkCommentValue(expectedValue) {
    expect(commentField().getAttribute("value")).toStrictEqual(expectedValue);
  }

  function selectOption(option) {
    toggleButton(option).dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
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
          <QuestionUserSelect sectionId={SECTION_ID} question={QUESTION} />
        </Provider>,
        container
      );
    });
  }
});
