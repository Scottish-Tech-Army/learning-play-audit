/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedSection"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import App from "./App";
import surveyStore from "./model/SurveyModel";
import { Provider } from "react-redux";
import { REFRESH_STATE } from "./model/ActionTypes";
import { SIGNED_IN, REGISTER } from "learning-play-audit-shared";
import { INPUT_STATE } from "./model/TestUtils";
import {
  INTRODUCTION,
  RESULTS,
  GALLERY,
  SUBMIT,
} from "./components/FixedSectionTypes";

jest.mock("@aws-amplify/core");
jest.spyOn(window, "scrollTo").mockImplementation(() => {
    // Do nothing
});

describe("main App", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial render - normal content", () => {
    // Default test data is signed in - just making sure
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        ...INPUT_STATE,
        authentication: {
          errorMessage: "",
          state: SIGNED_IN,
          user: { attributes: { email: "test@example.com" } },
        },
        hasSeenSplashPage: true,
      },
    });
    renderComponent();

    expect(getStartedSection()).toBeNull();
    expect(authenticatorSection()).toBeNull();
    expect(mainContent()).not.toBeNull();
  });

  it("initial render - splash page", () => {
    // Default test data is signed in - just making sure
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        ...INPUT_STATE,
        authentication: {
          errorMessage: "",
          state: SIGNED_IN,
          user: { attributes: { email: "test@example.com" } },
        },
        hasSeenSplashPage: false,
      },
    });
    renderComponent();

    expect(getStartedSection()).not.toBeNull();
    expect(authenticatorSection()).toBeNull();
    expect(mainContent()).toBeNull();
  });

  it("initial render - authentication", () => {
    // Default test data is signed in - just making sure
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        ...INPUT_STATE,
        authentication: {
          errorMessage: "",
          state: REGISTER,
          user: { attributes: { email: "test@example.com" } },
        },
        hasSeenSplashPage: false,
      },
    });
    renderComponent();

    expect(getStartedSection()).toBeNull();
    expect(authenticatorSection()).not.toBeNull();
    expect(mainContent()).toBeNull();
  });

  it("initial render - navbar section choice", () => {
    // Default test data is signed in - just making sure
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        ...INPUT_STATE,
        authentication: {
          errorMessage: "",
          state: SIGNED_IN,
          user: { attributes: { email: "test@example.com" } },
        },
        hasSeenSplashPage: true,
      },
    });
    renderComponent();
    checkSelectedSection(INTRODUCTION);

    click(fixedMenuItem(RESULTS));
    checkSelectedSection(RESULTS);

    click(fixedMenuItem(GALLERY));
    checkSelectedSection(GALLERY);

    click(fixedMenuItem(SUBMIT));
    checkSelectedSection(SUBMIT);

    click(fixedMenuItem("community"));
    checkSelectedSection("community");
  });

  function checkSelectedSection(expectedSection) {
    renderComponent();

    checkMenuItems(fixedMenuItems(), expectedSection);
    checkMenuItems(popupMenuItems(), expectedSection);

    expect(section(expectedSection)).not.toBeNull();
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

  const getStartedSection = () =>
    container.querySelector(".section.get-started");
  const authenticatorSection = () =>
    container.querySelector(".section.authenticator");
  const section = (sectionName) =>
    container.querySelector(".section." + sectionName);
  const mainContent = () => container.querySelector(".content.main");
  const fixedMenuItem = (id) =>
    container.querySelector(".nav-menu-container.fixed .nav-menu-item#" + id);
  const fixedMenuItems = () => [
    ...container.querySelectorAll(".nav-menu-container.fixed .nav-menu-item"),
  ];
  const popupMenuItems = () => [
    ...document.querySelectorAll(".nav-menu-container.popup .nav-menu-item"),
  ];

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <App />
        </Provider>,
        container
      );
    });
  }
});
