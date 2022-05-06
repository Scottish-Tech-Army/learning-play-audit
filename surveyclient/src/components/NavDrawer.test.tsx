/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedSection"] }] */

import React from "react";
import NavDrawer from "./NavDrawer";
import { surveyStore } from "../model/SurveyModel";
import { REFRESH_STATE } from "../model/ActionTypes";
import { INPUT_STATE, EMPTY_STATE } from "../model/TestUtils";
import { renderWithStore } from "./ReactTestUtils";
import { INTRODUCTION, RESULTS } from "../model/SurveySections";

const onPopupClose = jest.fn();

describe("component NavDrawer", () => {
  beforeEach(() => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
  });

  it("default render - with answers", () => {
    renderWithStore(
      <NavDrawer popupDrawerOpen={true} onPopupClose={onPopupClose} />
    );

    const expectedItemContent = [
      "Introduction",
      "1Background Information5 questions remaining0/5",
      "2Learning in Your Grounds8 questions remaining3/11",
      "3Play in Your Grounds17 questions remaining4/21",
      "4Wellbeing5 questions remaining8/13",
      "5Sustainability11 questions remaining7/18",
      "6Community and Participation10 questions remaining1/11",
      "7Local Greenspace8 questions remaining2/10",
      "8Your Practice10 questions remaining5/15",
      "9Your Reflection and Feedback-1 questions remaining6/5",
      "Results",
      "Photos",
      "Submit survey",
    ];

    expect(
      Array.from(fixedMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    expect(
      Array.from(popupMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    checkPopupVisible(true);
  });

  it("default render - no answers", () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: EMPTY_STATE });
    renderWithStore(
      <NavDrawer popupDrawerOpen={true} onPopupClose={onPopupClose} />
    );

    const expectedItemContent = [
      "Introduction",
      "1Background Information5 questions remaining0/5",
      "2Learning in Your Grounds11 questions remaining0/11",
      "3Play in Your Grounds21 questions remaining0/21",
      "4Wellbeing13 questions remaining0/13",
      "5Sustainability18 questions remaining0/18",
      "6Community and Participation11 questions remaining0/11",
      "7Local Greenspace10 questions remaining0/10",
      "8Your Practice15 questions remaining0/15",
      "9Your Reflection and Feedback5 questions remaining0/5",
      "Results",
      "Photos",
      "Submit survey",
    ];

    expect(
      Array.from(fixedMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    expect(
      Array.from(popupMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    checkPopupVisible(true);
  });

  it("default render - closed popup drawer", () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: EMPTY_STATE });
    renderWithStore(
      <NavDrawer popupDrawerOpen={false} onPopupClose={onPopupClose} />
    );

    const expectedItemContent = [
      "Introduction",
      "1Background Information5 questions remaining0/5",
      "2Learning in Your Grounds11 questions remaining0/11",
      "3Play in Your Grounds21 questions remaining0/21",
      "4Wellbeing13 questions remaining0/13",
      "5Sustainability18 questions remaining0/18",
      "6Community and Participation11 questions remaining0/11",
      "7Local Greenspace10 questions remaining0/10",
      "8Your Practice15 questions remaining0/15",
      "9Your Reflection and Feedback5 questions remaining0/5",
      "Results",
      "Photos",
      "Submit survey",
    ];

    expect(
      Array.from(fixedMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    expect(
      Array.from(popupMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    checkPopupVisible(false);
  });

  it("select section", async () => {
    const { user } = renderWithStore(
      <NavDrawer popupDrawerOpen={true} onPopupClose={onPopupClose} />
    );
    checkSelectedSection(INTRODUCTION);

    await user.click(fixedMenuItem(RESULTS));
    checkSelectedSection(RESULTS);

    await user.click(fixedMenuItem("community"));
    checkSelectedSection("community");

    await user.click(popupMenuItem(RESULTS));
    checkSelectedSection(RESULTS);

    await user.click(popupMenuItem("community"));
    checkSelectedSection("community");
  });

  it("close drawer", async () => {
    const { user } = renderWithStore(
      <NavDrawer popupDrawerOpen={true} onPopupClose={onPopupClose} />
    );
    expect(onPopupClose).not.toHaveBeenCalled();

    await user.click(closeButton()!);

    expect(onPopupClose).toHaveBeenCalledTimes(1);
  });

  it("close drawer - click outside drawer", async () => {
    const { user } = renderWithStore(
      <NavDrawer popupDrawerOpen={true} onPopupClose={onPopupClose} />
    );
    expect(onPopupClose).not.toHaveBeenCalled();

    const backdrop = document.querySelector(
      ".nav-menu-popup-modal div:first-child"
    )!;
    await user.click(backdrop);

    expect(onPopupClose).toHaveBeenCalledTimes(1);
  });

  const popupNavMenu = () =>
    document.querySelector(".nav-menu-container.popup");
  const fixedMenuItems = () =>
    document.querySelectorAll(".nav-menu-container.fixed .nav-menu-item");
  const popupMenuItems = () =>
    document.querySelectorAll(".nav-menu-container.popup .nav-menu-item");
  const fixedMenuItem = (id: string) =>
    document.querySelector(".nav-menu-container.fixed .nav-menu-item#" + id)!;
  const popupMenuItem = (id: string) =>
    document.querySelector(".nav-menu-container.popup .nav-menu-item#" + id)!;
  const closeButton = () => document.querySelector(".menu-button");

  function checkSelectedSection(expectedSectionId: string | null) {
    checkMenuItems(fixedMenuItems(), expectedSectionId);
    checkMenuItems(popupMenuItems(), expectedSectionId);

    // Check callback called
    expect(surveyStore.getState().currentSectionId).toStrictEqual(
      expectedSectionId
    );
  }

  function checkMenuItems(
    menuItems: NodeListOf<Element>,
    expectedSectionId: string | null
  ) {
    menuItems.forEach((menuItem) => {
      if (menuItem.getAttribute("id") === expectedSectionId) {
        expect(menuItem).toHaveClass("selected");
      } else {
        expect(menuItem).not.toHaveClass("selected");
      }
    });
  }

  function checkPopupVisible(expectPopupVisible: boolean) {
    if (expectPopupVisible) {
      expect(popupNavMenu()).not.toHaveClass("hidden");
    } else {
      expect(popupNavMenu()).toHaveClass("hidden");
    }
  }
});
