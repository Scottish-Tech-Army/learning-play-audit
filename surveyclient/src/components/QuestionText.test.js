/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkTextValue"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import QuestionText from "./QuestionText";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { RESET_STATE } from "../model/ActionTypes";

describe("component QuestionText", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    surveyStore.dispatch({ type: RESET_STATE });
    textFieldFlag = false;
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
  const PHOTO_BUTTON_TEXT = "add photoAdd Relevant Photo?";

  let textFieldFlag = false;

  it("initial empty state - text area", () => {
    renderComponent();

    expect(question().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT + PHOTO_BUTTON_TEXT
    );
    checkTextValue("");
  });

  it("initial empty state - text area (default)", () => {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <QuestionText
            sectionId={SECTION_ID}
            question={QUESTION}
            questionNumber={QUESTION_NUMBER}
          />
        </Provider>,
        container
      );
    });

    expect(question().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT + PHOTO_BUTTON_TEXT
    );
    checkTextValue("");
  });

  it("initial empty state - text field", () => {
    textFieldFlag = true;
    renderComponent();

    expect(question().textContent).toStrictEqual(QUESTION_TEXT);
    checkTextValue("");
  });

  it("set content - text area", () => {
    renderComponent();
    checkTextValue("");

    setTextArea("test value");
    checkTextValue("test value");

    setTextArea("");
    checkTextValue("");
  });

  it("set content - text field", () => {
    textFieldFlag = true;
    renderComponent();
    checkTextValue("");

    setTextField("test value");
    checkTextValue("test value");

    setTextField("");
    checkTextValue("");
  });

  const question = () => container.querySelector(".question");
  const textfield = () => container.querySelector(".question input");
  const textarea = () => container.querySelector(".question textarea");

  function checkTextValue(expectedText) {
    // Check visible selection
    if (textFieldFlag) {
      expect(textfield().getAttribute("value")).toStrictEqual(expectedText);
    } else {
      expect(textarea()).toHaveTextContent(expectedText);
    }

    // Check value in model
    expect(
      surveyStore.getState().answers[SECTION_ID][QUESTION_ID].answer
    ).toStrictEqual(expectedText);
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <QuestionText
            sectionId={SECTION_ID}
            question={QUESTION}
            questionNumber={QUESTION_NUMBER}
            textField={textFieldFlag}
          />
        </Provider>,
        container
      );
    });
  }

  function setTextArea(value) {
    const element = textarea();
    element.value = value;
    Simulate.change(element);
  }

  function setTextField(value) {
    const element = textfield();
    element.value = value;
    Simulate.change(element);
  }
});
