/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedSection"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import NavDrawer from "./NavDrawer";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { REFRESH_STATE } from "../model/ActionTypes";
import { INPUT_STATE, EMPTY_STATE } from "../model/TestUtils";
import { RESULTS } from "./FixedSectionTypes";

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

var currentSectionId = null;
function setCurrentSection(sectionId) {
  currentSectionId = sectionId;
}
var popupOpen = true;
function onPopupClose() {
  popupOpen = false;
}

describe("component NavDrawer", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    CircularProgressWithLabel.mockClear();
    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
    currentSectionId = null;
    popupOpen = true;
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("default render - with answers", () => {
    renderComponent();

    const expectedItemContent = [
      "Introduction",
      "1Background Information[0,5 questions remaining,0/5]",
      "2Learning in Your Grounds[27.272727272727273,8 questions remaining,3/11]",
      "3Play[19.047619047619047,17 questions remaining,4/21]",
      "4Wellbeing[61.53846153846154,5 questions remaining,8/13]",
      "5Sustainability[46.666666666666664,8 questions remaining,7/15]",
      "6Community and Participation[9.090909090909092,10 questions remaining,1/11]",
      "7Local Greenspace[20,8 questions remaining,2/10]",
      "8Your Practice[33.333333333333336,10 questions remaining,5/15]",
      "9Your Reflection and Feedback[120,-1 questions remaining,6/5]",
      "Results",
      "Photos",
      "Submit survey",
    ];

    expect(fixedMenuItems().map((item) => item.textContent)).toStrictEqual(
      expectedItemContent
    );
    expect(popupMenuItems().map((item) => item.textContent)).toStrictEqual(
      expectedItemContent
    );
    checkPopupVisible(true);
  });

  it("default render - no answers", () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: EMPTY_STATE });
    renderComponent();

    const expectedItemContent = [
      "Introduction",
      "1Background Information[0,5 questions remaining,0/5]",
      "2Learning in Your Grounds[0,11 questions remaining,0/11]",
      "3Play[0,21 questions remaining,0/21]",
      "4Wellbeing[0,13 questions remaining,0/13]",
      "5Sustainability[0,15 questions remaining,0/15]",
      "6Community and Participation[0,11 questions remaining,0/11]",
      "7Local Greenspace[0,10 questions remaining,0/10]",
      "8Your Practice[0,15 questions remaining,0/15]",
      "9Your Reflection and Feedback[0,5 questions remaining,0/5]",
      "Results",
      "Photos",
      "Submit survey",
    ];

    expect(fixedMenuItems().map((item) => item.textContent)).toStrictEqual(
      expectedItemContent
    );
    expect(popupMenuItems().map((item) => item.textContent)).toStrictEqual(
      expectedItemContent
    );
    checkPopupVisible(true);
  });

  it("default render - closed popup drawer", () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: EMPTY_STATE });
    popupOpen = false;
    renderComponent();

    const expectedItemContent = [
      "Introduction",
      "1Background Information[0,5 questions remaining,0/5]",
      "2Learning in Your Grounds[0,11 questions remaining,0/11]",
      "3Play[0,21 questions remaining,0/21]",
      "4Wellbeing[0,13 questions remaining,0/13]",
      "5Sustainability[0,15 questions remaining,0/15]",
      "6Community and Participation[0,11 questions remaining,0/11]",
      "7Local Greenspace[0,10 questions remaining,0/10]",
      "8Your Practice[0,15 questions remaining,0/15]",
      "9Your Reflection and Feedback[0,5 questions remaining,0/5]",
      "Results",
      "Photos",
      "Submit survey",
    ];

    expect(fixedMenuItems().map((item) => item.textContent)).toStrictEqual(
      expectedItemContent
    );
    expect(popupMenuItems().map((item) => item.textContent)).toStrictEqual(
      expectedItemContent
    );
    checkPopupVisible(false);
  });

  it("select section", () => {
    renderComponent();
    checkSelectedSection(null);

    click(fixedMenuItem(RESULTS));
    checkSelectedSection(RESULTS);

    click(fixedMenuItem("community"));
    checkSelectedSection("community");

    currentSectionId = null;
    checkSelectedSection(null);

    click(popupMenuItem(RESULTS));
    checkSelectedSection(RESULTS);

    click(popupMenuItem("community"));
    checkSelectedSection("community");

    currentSectionId = null;
    checkSelectedSection(null);
  });

  it("close drawer", () => {
    renderComponent();
    expect(popupOpen).toStrictEqual(true);

    click(closeButton());
    renderComponent();

    expect(popupOpen).toStrictEqual(false);
    checkPopupVisible(false);
  });

  it("close drawer - click outside drawer", () => {
    renderComponent();
    expect(popupOpen).toStrictEqual(true);

    click(backdrop());
    renderComponent();

    expect(popupOpen).toStrictEqual(false);
    checkPopupVisible(false);
  });

  const popupNavMenu = () =>
    document.querySelector(".nav-menu-container.popup");
  const fixedMenuItems = () => [
    ...container.querySelectorAll(".nav-menu-container.fixed .nav-menu-item"),
  ];
  const popupMenuItems = () => [
    ...document.querySelectorAll(".nav-menu-container.popup .nav-menu-item"),
  ];
  const fixedMenuItem = (id) =>
    container.querySelector(".nav-menu-container.fixed .nav-menu-item#" + id);
  const popupMenuItem = (id) =>
    document.querySelector(".nav-menu-container.popup .nav-menu-item#" + id);
  const backdrop = () =>
    document.querySelector(".nav-menu-popup-modal div:first-child");
  const closeButton = () => document.querySelector(".menu-button");

  function checkSelectedSection(expectedSection) {
    renderComponent();

    checkMenuItems(fixedMenuItems(), expectedSection);
    checkMenuItems(popupMenuItems(), expectedSection);

    // Check callback called
    expect(currentSectionId).toStrictEqual(expectedSection);
  }

  function checkMenuItems(menuItems, expectedSection) {
    menuItems.forEach((menuItem) => {
      if (menuItem.getAttribute("id") === expectedSection) {
        expect(menuItem.getAttribute("class")).toContain("selected");
      } else {
        expect(menuItem.getAttribute("class")).not.toContain("selected");
      }
    });
  }

  function checkPopupVisible(checkPopupVisible) {
    if (checkPopupVisible) {
      expect(popupNavMenu().getAttribute("class")).not.toContain("hidden");
    } else {
      expect(popupNavMenu().getAttribute("class")).toContain("hidden");
    }
  }

  function click(element) {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <NavDrawer
            popupDrawerOpen={popupOpen}
            onPopupClose={onPopupClose}
            currentSection={currentSectionId}
            setCurrentSection={setCurrentSection}
          />
        </Provider>,
        container
      );
    });
  }
});
