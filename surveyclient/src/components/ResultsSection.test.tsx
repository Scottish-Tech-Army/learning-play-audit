import React from "react";
import ResultsSection from "./ResultsSection";
import { QuestionAnswer, surveyStore } from "../model/SurveyModel";
import { REFRESH_STATE, SET_CURRENT_SECTION } from "../model/ActionTypes";
import { INPUT_STATE } from "../model/TestUtils";
import Chart from "chart.js";
import rfdc from "rfdc";
import { renderWithStore } from "./ReactTestUtils";
import { GALLERY, RESULTS } from "../model/SurveySections";

jest.mock("chart.js");

const clone = rfdc();

describe("component ResultsSection", () => {
  beforeEach(() => {
    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
    surveyStore.dispatch({ type: SET_CURRENT_SECTION, sectionId: RESULTS });
  });

  it("standard render", () => {
    // set some answer values
    const inputState = clone(INPUT_STATE);

    (inputState.answers.learning.RME as QuestionAnswer).answer = "a";
    (inputState.answers.learning.arts as QuestionAnswer).answer = "b";
    (inputState.answers.learning.classroom as QuestionAnswer).answer = "c";
    (inputState.answers.learning.disturbance as QuestionAnswer).answer = "d";
    const learningValue = ((1 + 0.7 + 0.3 + 0) * 100) / 11;

    (inputState.answers.play.balancing as QuestionAnswer).answer = "a";
    (inputState.answers.play.bark as QuestionAnswer).answer = "b";
    (inputState.answers.play.bushes as QuestionAnswer).answer = "c";
    (inputState.answers.play.climbing as QuestionAnswer).answer = "d";
    const playValue = ((1 + 0.7 + 0.3 + 0) * 100) / 21;

    (inputState.answers.wellbeing.attractive as QuestionAnswer).answer = "a";
    (inputState.answers.wellbeing.colourful as QuestionAnswer).answer = "b";
    (inputState.answers.wellbeing.seating as QuestionAnswer).answer = "c"; // Double weight
    (inputState.answers.wellbeing.goodimpression as QuestionAnswer).answer =
      "d";
    const wellbeingValue = ((1 + 0.7 + 0.3 * 2 + 0) * 100) / 16;

    (inputState.answers.sustainability.birdboxes as QuestionAnswer).answer =
      "a";
    (inputState.answers.sustainability.bughotels as QuestionAnswer).answer =
      "b";
    (inputState.answers.sustainability.composting as QuestionAnswer).answer =
      "c";
    (inputState.answers.sustainability.cycle as QuestionAnswer).answer = "d";
    const sustainabilityValue = ((1 + 0.7 + 0.3 + 0) * 100) / 18;

    (inputState.answers.community.adultsoutside as QuestionAnswer).answer = "a";
    (inputState.answers.community.childrenoutside as QuestionAnswer).answer =
      "b";
    (inputState.answers.community.communityoutside as QuestionAnswer).answer =
      "c"; // Half weight
    (inputState.answers.community.managegrowing as QuestionAnswer).answer = "d";
    const communityValue = ((1 + 0.7 + 0.3 * 0.5 + 0) * 100) / 8.5;

    const expectedOutdoorData = [
      learningValue,
      playValue,
      wellbeingValue,
      sustainabilityValue,
      communityValue,
    ];

    (inputState.answers.greenspace.accessible as QuestionAnswer).answer = "a";
    (inputState.answers.greenspace.frequentuse as QuestionAnswer).answer = "c";
    (inputState.answers.greenspace.wildlife as QuestionAnswer).answer = "d";
    (inputState.answers.greenspace.changes as QuestionAnswer).answer = "b";

    const expectedGreenspaceData = [100, 30, 0, 0, 70];

    (inputState.answers.practice.curriculumtopic as QuestionAnswer).answer =
      "b";
    (
      inputState.answers.practice.developingcurriculum as QuestionAnswer
    ).answer = "c";
    (inputState.answers.practice.growfood as QuestionAnswer).answer = "d";
    const practiceLearningValue = ((0.7 + 0.3 + 0) * 100) / 6;

    (inputState.answers.practice.allages as QuestionAnswer).answer = "a";
    const practicePlayValue = (1 * 100) / 9;

    const expectedPracticeData = [practiceLearningValue, practicePlayValue];

    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });

    renderWithStore(<ResultsSection />);

    expect(largeChartCanvases()).toHaveLength(3);
    expect(smallChartCanvases()).toHaveLength(3);
    expect(Chart).toHaveBeenCalledTimes(6);

    // Check chart data
    const mockChart = Chart as unknown as jest.Mock;
    const smallOutdoorChartConfig = mockChart.mock.calls[0][1];
    const largeOutdoorChartConfig = mockChart.mock.calls[1][1];
    const smallGreenspaceChartConfig = mockChart.mock.calls[2][1];
    const largeGreenspaceChartConfig = mockChart.mock.calls[3][1];
    const smallPracticeChartConfig = mockChart.mock.calls[4][1];
    const largePracticeChartConfig = mockChart.mock.calls[5][1];

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

  it("bottom navigation", async () => {
    const { getByRole, user } = renderWithStore(<ResultsSection />);

    await user.click(getByRole("button", { name: "previous section" }));
    expect(surveyStore.getState().currentSectionId).toBe("reflection");

    await user.click(getByRole("button", { name: "next section" }));
    expect(surveyStore.getState().currentSectionId).toBe(RESULTS);

    await user.click(getByRole("button", { name: "next section" }));
    expect(surveyStore.getState().currentSectionId).toBe(GALLERY);
  });

  const smallChartCanvases = () =>
    document.querySelectorAll("canvas.small-chart");
  const largeChartCanvases = () =>
    document.querySelectorAll("canvas.large-chart");
});
