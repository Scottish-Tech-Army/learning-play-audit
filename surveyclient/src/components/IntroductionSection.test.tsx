/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedOption"] }] */

import React from "react";
import { SET_CURRENT_SECTION } from "../model/ActionTypes";
import { surveyStore } from "../model/SurveyModel";
import { INTRODUCTION } from "../model/SurveySections";
import IntroductionSection from "./IntroductionSection";
import { renderWithStore } from "./ReactTestUtils";

describe("component IntroductionSection", () => {
  it("selection options", async () => {
    const { getByRole, user } = renderWithStore(<IntroductionSection />);

    const optionAButton = getByRole("button", { name: "strongly agree" });
    const optionBButton = getByRole("button", { name: "tend to agree" });
    const optionCButton = getByRole("button", { name: "tend to disagree" });
    const optionDButton = getByRole("button", { name: "strongly disagree" });

    expect(optionAButton).not.toHaveClass("selected");
    expect(optionBButton).not.toHaveClass("selected");
    expect(optionCButton).not.toHaveClass("selected");
    expect(optionDButton).not.toHaveClass("selected");

    await user.click(optionAButton);
    expect(optionAButton).toHaveClass("selected");

    await user.click(optionBButton);
    expect(optionBButton).toHaveClass("selected");

    await user.click(optionCButton);
    expect(optionCButton).toHaveClass("selected");

    await user.click(optionDButton);
    expect(optionDButton).toHaveClass("selected");

    await user.click(optionAButton);
    expect(optionAButton).toHaveClass("selected");

    // Test unselection
    await user.click(optionAButton);
    expect(optionAButton).not.toHaveClass("selected");
    expect(optionBButton).not.toHaveClass("selected");
    expect(optionCButton).not.toHaveClass("selected");
    expect(optionDButton).not.toHaveClass("selected");
  });

  it("bottom navigation", async () => {
    surveyStore.dispatch({
      type: SET_CURRENT_SECTION,
      sectionId: INTRODUCTION,
    });
    const { getByRole, user } = renderWithStore(<IntroductionSection />);

    await user.click(getByRole("button", { name: "next section" }));
    expect(surveyStore.getState().currentSectionId).toBe("background");
  });
});
