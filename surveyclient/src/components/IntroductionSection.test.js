/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedOption"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import IntroductionSection from "./IntroductionSection";

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

  const toggleButtons = () =>
    container.querySelectorAll(".toggle-button-group button");
  const toggleButton = (id) =>
    container.querySelector(".toggle-button-group button#" + id);

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
      render(<IntroductionSection />, container);
    });
  }
});
