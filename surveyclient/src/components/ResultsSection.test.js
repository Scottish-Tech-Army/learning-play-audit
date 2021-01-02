import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import ResultsSection from "./ResultsSection";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { REFRESH_STATE } from "../model/ActionTypes";
import { RESULTS } from "./FixedSectionTypes";
import { INPUT_STATE } from "../model/TestUtils";
import Chart from "chart.js";
import rfdc from "rfdc";

jest.mock("chart.js");

const clone = rfdc();

var storedSectionId = null;
function setSectionId(sectionId) {
  storedSectionId = sectionId;
}

const SECTIONS = [
  { id: "section1" },
  { id: "section2" },
  { id: RESULTS },
  { id: "section4" },
];

describe("component ResultsSection", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });

    Chart.mockReset();
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("standard render", () => {
    // set some answer values
    const inputState = clone(INPUT_STATE);

    inputState.answers.learning.RME.answer = "a";
    inputState.answers.learning.arts.answer = "b";
    inputState.answers.learning.classroom.answer = "c";
    inputState.answers.learning.disturbance.answer = "d";
    const learningValue = ((1 + 0.7 + 0.3 + 0) * 100) / 11;

    inputState.answers.play.balancing.answer = "a";
    inputState.answers.play.bark.answer = "b";
    inputState.answers.play.bushes.answer = "c";
    inputState.answers.play.climbing.answer = "d";
    const playValue = ((1 + 0.7 + 0.3 + 0) * 100) / 21;

    inputState.answers.wellbeing.attractive.answer = "a";
    inputState.answers.wellbeing.colourful.answer = "b";
    inputState.answers.wellbeing.seating.answer = "c"; // Double weight
    inputState.answers.wellbeing.goodimpression.answer = "d";
    const wellbeingValue = ((1 + 0.7 + 0.3 * 2 + 0) * 100) / 16;

    inputState.answers.sustainability.birdboxes.answer = "a";
    inputState.answers.sustainability.bughotels.answer = "b";
    inputState.answers.sustainability.composting.answer = "c";
    inputState.answers.sustainability.cycle.answer = "d";
    const sustainabilityValue = ((1 + 0.7 + 0.3 + 0) * 100) / 15;

    inputState.answers.community.adultsoutside.answer = "a";
    inputState.answers.community.childrenoutside.answer = "b";
    inputState.answers.community.communityoutside.answer = "c"; // Half weight
    inputState.answers.community.managegrowing.answer = "d";
    const communityValue = ((1 + 0.7 + 0.3 * 0.5 + 0) * 100) / 8.5;

    const expectedOutdoorData = [
      learningValue,
      playValue,
      wellbeingValue,
      sustainabilityValue,
      communityValue,
    ];

    inputState.answers.greenspace.accessible.answer = "a";
    inputState.answers.greenspace.frequentuse.answer = "c";
    inputState.answers.greenspace.wildlife.answer = "d";
    inputState.answers.greenspace.changes.answer = "b";

    const expectedGreenspaceData = [100, 30, 0, 0, 70];

    inputState.answers.practice.curriculumtopic.answer = "b";
    inputState.answers.practice.developingcurriculum.answer = "c";
    inputState.answers.practice.growfood.answer = "d";
    const practiceLearningValue = ((0.7 + 0.3 + 0) * 100) / 6;

    inputState.answers.practice.allages.answer = "a";
    const practicePlayValue = (1 * 100) / 9;

    const expectedPracticeData = [practiceLearningValue, practicePlayValue];

    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });

    renderComponent();

    expect(largeChartCanvases()).toHaveLength(3);
    expect(smallChartCanvases()).toHaveLength(3);
    expect(Chart).toHaveBeenCalledTimes(6);

    // Check chart data
    const smallOutdoorChartConfig = Chart.mock.calls[0][1];
    const largeOutdoorChartConfig = Chart.mock.calls[1][1];
    const smallGreenspaceChartConfig = Chart.mock.calls[2][1];
    const largeGreenspaceChartConfig = Chart.mock.calls[3][1];
    const smallPracticeChartConfig = Chart.mock.calls[4][1];
    const largePracticeChartConfig = Chart.mock.calls[5][1];

    expect(smallOutdoorChartConfig.data.datasets[0].data).toStrictEqual(
      expectedOutdoorData
    );
    expect(largeOutdoorChartConfig.data.datasets[0].data).toStrictEqual(
      expectedOutdoorData
    );
    expect(smallGreenspaceChartConfig.data.datasets[0].data).toStrictEqual(
      expectedGreenspaceData
    );
    expect(largeGreenspaceChartConfig.data.datasets[0].data).toStrictEqual(
      expectedGreenspaceData
    );
    expect(smallPracticeChartConfig.data.datasets[0].data).toStrictEqual(
      expectedPracticeData
    );
    expect(largePracticeChartConfig.data.datasets[0].data).toStrictEqual(
      expectedPracticeData
    );
  });

  it("bottom navigation", () => {
    storedSectionId = null;
    renderComponent();

    clickPreviousButton();
    expect(storedSectionId).toStrictEqual("section2");

    clickNextButton();
    expect(storedSectionId).toStrictEqual("section4");
  });

  const smallChartCanvases = () =>
    container.querySelectorAll("canvas.small-chart");
  const largeChartCanvases = () =>
    container.querySelectorAll("canvas.large-chart");

  const previousButton = () =>
    container.querySelector(".section .previous-section-button");
  const nextButton = () =>
    container.querySelector(".section .next-section-button");

  function clickPreviousButton() {
    previousButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
  function clickNextButton() {
    nextButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <ResultsSection
            sections={SECTIONS}
            setCurrentSection={setSectionId}
          />
        </Provider>,
        container
      );
    });
  }
});
