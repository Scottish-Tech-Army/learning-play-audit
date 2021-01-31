/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import SectionBottomNavigation from "./SectionBottomNavigation";

var storedSectionId = null;
function setSectionId(sectionId) {
  storedSectionId = sectionId;
}
var currentSectionId = null;

const SECTIONS = [
  { id: "section1" },
  { id: "section2" },
  { id: "section3" },
  { id: "section4" },
];

describe("component SectionBottomNavigation", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    storedSectionId = null;
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("introduction section hidden", () => {
    currentSectionId = "introduction";
    renderComponent();

    expect(previousButton()).not.toBeNull();
    expect(nextButton()).not.toBeNull();
  });

  it("first section", () => {
    currentSectionId = "section1";
    renderComponent();
    expect(storedSectionId).toBeNull();

    expect(previousButton().disabled).toStrictEqual(true);
    expect(previousButton().getAttribute("class")).toContain("hidden");
    expect(nextButton().disabled).toStrictEqual(false);
    expect(nextButton().getAttribute("class")).not.toContain("hidden");

    clickNextButton();
    expect(storedSectionId).toStrictEqual("section2");
  });

  it("middle section", () => {
    currentSectionId = "section3";
    renderComponent();
    expect(storedSectionId).toBeNull();

    expect(previousButton().disabled).toStrictEqual(false);
    expect(previousButton().getAttribute("class")).not.toContain("hidden");
    expect(nextButton().disabled).toStrictEqual(false);
    expect(nextButton().getAttribute("class")).not.toContain("hidden");

    clickPreviousButton();
    expect(storedSectionId).toStrictEqual("section2");
    clickNextButton();
    expect(storedSectionId).toStrictEqual("section4");
  });

  it("last section", () => {
    currentSectionId = "section4";
    renderComponent();
    expect(storedSectionId).toBeNull();

    expect(previousButton().disabled).toStrictEqual(false);
    expect(previousButton().getAttribute("class")).not.toContain("hidden");
    expect(nextButton().disabled).toStrictEqual(true);
    expect(nextButton().getAttribute("class")).toContain("hidden");

    clickPreviousButton();
    expect(storedSectionId).toStrictEqual("section3");
  });

  const previousButton = () =>
    container.querySelector(".previous-section-button");
  const nextButton = () => container.querySelector(".next-section-button");

  function clickPreviousButton() {
    previousButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function clickNextButton() {
    nextButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function renderComponent() {
    act(() => {
      render(
        <SectionBottomNavigation
          sections={SECTIONS}
          currentSectionId={currentSectionId}
          setCurrentSectionId={setSectionId}
        />,
        container
      );
    });
  }
});
