import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import Section from "./Section";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { REFRESH_STATE } from "../model/ActionTypes";
import { INPUT_STATE } from "../model/TestUtils";
import rfdc from "rfdc";
import {
  BACKGROUND,
  SCALE_WITH_COMMENT,
  TEXT_AREA,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
} from "learning-play-audit-shared";

jest.mock("./CircularProgressWithLabel", () => {
  return {
    __esModule: true,
    default: jest.fn(({ value, tooltip, label }) => (
      <div>
        [{value},{tooltip},{label}]
      </div>
    )),
  };
});

const scrollBySpy = jest.spyOn(window, "scrollBy");

const clone = rfdc();

var storedSectionId = null;
function setSectionId(sectionId) {
  storedSectionId = sectionId;
}

const SECTIONS = [
  { id: "section1" },
  { id: "section2" },
  { id: "community" },
  { id: "section4" },
];

const SECTION_CONTENT = {
  number: 6,
  title: "Community and Participation",
  id: "community",
  content: (addQuestion) => (
    <>
      <h2>Test questions</h2>
      {addQuestion(USER_TYPE_WITH_COMMENT, "parentsdesign", "question 1")}
      {addQuestion(SCALE_WITH_COMMENT, "pupilsdesign", "question 2")}
      {addQuestion(TEXT_WITH_YEAR, "datedImprovements", "question 3")}
      {addQuestion(TEXT_AREA, "othercommunity", "question 4")}
    </>
  ),
};
var sectionContent = SECTION_CONTENT;

const NOTE_BUTTON_TEXT = "Add Additional Information?";
const PHOTO_BUTTON_TEXT = "add photoAdd Relevant Photo?";

describe("component Section", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
    sectionContent = SECTION_CONTENT;
    scrollBySpy.mockReset();
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("standard render", () => {
    renderComponent();

    expect(mobileHeader().textContent).toStrictEqual(
      "6Community and Participation[25,3 questions remaining,1/4]"
    );
    expect(section().querySelector("h1").textContent).toStrictEqual(
      "6. Community and Participation"
    );
    expect(questions().map((question) => question.textContent)).toStrictEqual([
      "I am ateacherparentpupilother Details",
      "2question 2strongly agreetend to agreetend to disagreestrongly disagree" +
        NOTE_BUTTON_TEXT +
        PHOTO_BUTTON_TEXT,
      "3question 3" +
        PHOTO_BUTTON_TEXT +
        "Improvement 1YearImprovement 2YearImprovement 3Year",
      "4question 4" + PHOTO_BUTTON_TEXT + "test othercommunity",
    ]);
    expect(section().getAttribute("class")).not.toContain("background");
  });

  it("background section render", () => {
    sectionContent = {
      ...SECTION_CONTENT,
      id: BACKGROUND,
      content: (addQuestion) => <h2>Test questions</h2>,
    };

    renderComponent();

    expect(section().getAttribute("class")).toContain("background");
  });

  it("scroll to unanswered - none unanswered (shortcut using answerCounts)", () => {
    const inputState = clone(INPUT_STATE);
    inputState.answerCounts.community.answer = 50;
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderComponent();

    click(mobileHeader());
    expect(scrollBySpy).not.toHaveBeenCalled();
  });

  it("scroll to unanswered - none unanswered", () => {
    renderComponent();

    click(mobileHeader());
    expect(scrollBySpy).not.toHaveBeenCalled();
  });

  it("scroll to unanswered - one unanswered", () => {
    const inputState = clone(INPUT_STATE);
    inputState.answers.community.pupilsdesign.answer = "";
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderComponent();

    click(mobileHeader());
    expect(scrollBySpy).toHaveBeenCalledWith(0, -220);
  });

  it("scroll to unanswered - dated unanswered", () => {
    const inputState = clone(INPUT_STATE);
    inputState.answers.community.datedImprovements = {
      answer1: "",
      answer2: "",
      answer3: "",
      year1: "",
      year2: null,
      year3: "",
    };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderComponent();

    click(mobileHeader());
    expect(scrollBySpy).toHaveBeenCalledWith(0, -220);
  });

  it("bottom navigation", () => {
    storedSectionId = null;
    renderComponent();

    click(previousButton());
    expect(storedSectionId).toStrictEqual("section2");

    click(nextButton());
    expect(storedSectionId).toStrictEqual("section4");
  });

  const previousButton = () =>
    container.querySelector(".section .previous-section-button");
  const nextButton = () =>
    container.querySelector(".section .next-section-button");
  const section = () => container.querySelector(".section");
  const questions = () => [...container.querySelectorAll(".question")];
  const mobileHeader = () =>
    container.querySelector(".section .mobile-header div");

  function click(element) {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <Section
            section={sectionContent}
            sections={SECTIONS}
            setCurrentSection={setSectionId}
          />
        </Provider>,
        container
      );
    });
  }
});
