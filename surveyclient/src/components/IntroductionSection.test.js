/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedOption"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import IntroductionSection from "./IntroductionSection";
import { INTRODUCTION } from "./FixedSectionTypes";

var storedSectionId = null;
function setSectionId(sectionId) {
  storedSectionId = sectionId;
}

const SECTIONS = [{ id: INTRODUCTION }, { id: "section1" }, { id: "section2" }];

describe("component IntroductionSection", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("selection options", () => {
    renderComponent();
    checkSelectedOption(null);

    selectOption("a");
    checkSelectedOption("a");

    selectOption("b");
    checkSelectedOption("b");

    selectOption("c");
    checkSelectedOption("c");

    selectOption("d");
    checkSelectedOption("d");

    selectOption("a");
    checkSelectedOption("a");

    // Test unselection
    selectOption("a");
    checkSelectedOption(null);
  });

  it("bottom navigation", () => {
    storedSectionId = null;
    renderComponent();

    click(nextButton());
    expect(storedSectionId).toStrictEqual("section1");
  });

  const toggleButtons = () =>
    container.querySelectorAll(".toggle-button-group button");
  const toggleButton = (id) =>
    container.querySelector(".toggle-button-group button#" + id);
  const nextButton = () =>
    container.querySelector(".section .next-section-button");

  function click(element) {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function checkSelectedOption(expectedOption) {
    // Check visible selection
    const buttons = toggleButtons();
    expect(buttons).toHaveLength(4);
    buttons.forEach((button) => {
      if (button.getAttribute("id") === expectedOption) {
        expect(button.getAttribute("class")).toContain("selected");
      } else {
        expect(button.getAttribute("class")).not.toContain("selected");
      }
    });
  }

  function selectOption(option) {
    toggleButton(option).dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
  }

  function renderComponent() {
    act(() => {
      render(
        <IntroductionSection
          sections={SECTIONS}
          setCurrentSection={setSectionId}
        />,
        container
      );
    });
  }
});
