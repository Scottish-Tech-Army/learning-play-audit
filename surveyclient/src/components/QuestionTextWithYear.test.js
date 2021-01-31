/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkTextValues"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import QuestionTextWithYear from "./QuestionTextWithYear";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { RESET_STATE } from "../model/ActionTypes";

describe("component QuestionTextWithYear", () => {
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

  const SECTION_ID = "community";
  const QUESTION_ID = "datedImprovements";
  const QUESTION_NUMBER = 17;
  const QUESTION_TEXT = "test question text";
  const QUESTION = {
    id: QUESTION_ID,
    text: QUESTION_TEXT,
  };
  const PHOTO_BUTTON_TEXT = "add photoAdd Relevant Photo?";

  it("initial empty state", () => {
    renderComponent();

    expect(questionLine().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT + PHOTO_BUTTON_TEXT
    );
    checkTextValues("", "", "", "", "", "");
  });

  it("set content - all fields", () => {
    renderComponent();
    checkTextValues("", "", "", "", "", "");

    setTextField("answer1-text", "test value answer1");
    setTextField("year1-text", "test value year1");
    setTextField("answer2-text", "test value answer2");
    setTextField("year2-text", "test value year2");
    setTextField("answer3-text", "test value answer3");
    setTextField("year3-text", "test value year3");
    checkTextValues(
      "test value answer1",
      "test value year1",
      "test value answer2",
      "test value year2",
      "test value answer3",
      "test value year3"
    );

    setTextField("answer1-text", "");
    setTextField("year1-text", "");
    setTextField("answer2-text", "");
    setTextField("year2-text", "");
    setTextField("answer3-text", "");
    setTextField("year3-text", "");
    checkTextValues("", "", "", "", "", "");
  });

  const questionLine = () => container.querySelector(".question-line");
  const textfield = (id) => container.querySelector(".question input#" + id);

  function checkTextValues(
    expectedAnswer1,
    expectedYear1,
    expectedAnswer2,
    expectedYear2,
    expectedAnswer3,
    expectedYear3
  ) {
    // Check visible selection
    expect(textfield("answer1-text").getAttribute("value")).toStrictEqual(
      expectedAnswer1
    );
    expect(textfield("year1-text").getAttribute("value")).toStrictEqual(
      expectedYear1
    );
    expect(textfield("answer2-text").getAttribute("value")).toStrictEqual(
      expectedAnswer2
    );
    expect(textfield("year2-text").getAttribute("value")).toStrictEqual(
      expectedYear2
    );
    expect(textfield("answer3-text").getAttribute("value")).toStrictEqual(
      expectedAnswer3
    );
    expect(textfield("year3-text").getAttribute("value")).toStrictEqual(
      expectedYear3
    );

    // Check value in model
    expect(
      surveyStore.getState().answers[SECTION_ID][QUESTION_ID]
    ).toStrictEqual({
      answer1: expectedAnswer1,
      answer2: expectedAnswer2,
      answer3: expectedAnswer3,
      year1: expectedYear1,
      year2: expectedYear2,
      year3: expectedYear3,
    });
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <QuestionTextWithYear
            sectionId={SECTION_ID}
            question={QUESTION}
            questionNumber={QUESTION_NUMBER}
          />
        </Provider>,
        container
      );
    });
  }

  function setTextField(id, value) {
    const element = textfield(id);
    element.value = value;
    Simulate.change(element);
  }
});
