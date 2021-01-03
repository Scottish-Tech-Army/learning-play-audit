import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import SectionSummary from "./SectionSummary";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { REFRESH_STATE } from "../model/ActionTypes";
import { INPUT_STATE, EMPTY_STATE } from "../model/TestUtils";
import rfdc from "rfdc";

jest.mock("./CircularProgressWithLabel", () => {
  return {
    __esModule: true,
    default: jest.fn((props) => <div>progress</div>),
  };
});

const clone = rfdc();

var componentClicked = false;
function handleClick() {
  componentClicked = true;
}

const SECTION_ID = "community";
const SECTION_NUMBER = 17;
const SECTION_TITLE = "test section title";
const SECTION = {
  id: SECTION_ID,
  number: SECTION_NUMBER,
  title: SECTION_TITLE,
};

var currentSectionId = "other section";
const TOTAL_QUESTIONS = 5;

describe("component SectionSummary", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    CircularProgressWithLabel.mockClear();
    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
    componentClicked = false;
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("unanswered section", () => {
    const inputState = clone(EMPTY_STATE);
    inputState.answerCounts.community.answer = 0;

    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderComponent();

    expect(summary().textContent).toStrictEqual(
      SECTION_NUMBER + SECTION_TITLE + "progress"
    );
    checkProgressCalls({
      label: "0/5",
      tooltip: "5 questions remaining",
      value: 0,
    });
  });

  it("answered section", () => {
    const inputState = clone(INPUT_STATE);
    inputState.answerCounts.community.answer = 5;

    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderComponent();

    expect(summary().textContent).toStrictEqual(
      SECTION_NUMBER + SECTION_TITLE + "progress"
    );
    checkProgressCalls({
      label: "5/5",
      tooltip: "0 questions remaining",
      value: 100,
    });
  });

  it("incomplete section", () => {
    const inputState = clone(INPUT_STATE);
    inputState.answerCounts.community.answer = 4;

    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderComponent();

    expect(summary().textContent).toStrictEqual(
      SECTION_NUMBER + SECTION_TITLE + "progress"
    );
    checkProgressCalls({
      label: "4/5",
      tooltip: "1 question remaining",
      value: 80,
    });
  });

  it("unselected section", () => {
    renderComponent();

    expect(summary().getAttribute("class")).not.toContain("selected");
  });

  it("selected section", () => {
    currentSectionId = SECTION_ID;
    renderComponent();

    expect(summary().getAttribute("class")).toContain("selected");
  });

  it("click summary", () => {
    renderComponent();
    expect(componentClicked).toStrictEqual(false);

    clickSummary();
    expect(componentClicked).toStrictEqual(true);
  });

  const summary = () => container.querySelector("div");

  function clickSummary() {
    summary().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function checkProgressCalls(...expectedValues) {
    expect(CircularProgressWithLabel).toHaveBeenCalledTimes(
      expectedValues.length
    );
    expectedValues.forEach((expectedValue, i) => {
      expect(CircularProgressWithLabel).toHaveBeenNthCalledWith(
        i + 1,
        expectedValue,
        {}
      );
    });
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <SectionSummary
            section={SECTION}
            currentSectionId={currentSectionId}
            onClick={handleClick}
            totalQuestions={TOTAL_QUESTIONS}
          />
        </Provider>,
        container
      );
    });
  }
});
