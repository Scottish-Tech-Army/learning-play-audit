import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import CircularProgressWithLabel from "./CircularProgressWithLabel";

describe("component CircularProgressWithLabel", () => {
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

  var value = 0;
  const TOOLTIP = "test tooltip";
  const LABEL = "test label";

  const FULL_CIRCUMFERENCE = "131.9";
  const HALF_CIRCUMFERENCE = "66.0";

  // Validating against the whole SVG is brittle, but the alternative would effectively replicate the production code
  const expectedSvg = (dashArrayLength, dashOffsetLength) =>
    '<svg viewBox="-22.5 -22.5 45 45" width="45" height="45">' +
    "<title>test tooltip</title>" +
    '<circle stroke="#807D7D" fill="white" r="21" stroke-width="3"></circle>' +
    '<g transform="rotate(-90)">' +
    '<circle stroke="#afcd4b" fill="none" stroke-dasharray="' +
    dashArrayLength +
    '" stroke-dashoffset="' +
    dashOffsetLength +
    'px" r="21" stroke-width="3"></circle></g>' +
    '<text dominant-baseline="middle" text-anchor="middle">test label</text>' +
    "</svg>";

  it("render none", () => {
    value = 0;
    renderComponent();

    expect(progressDiv().getAttribute("aria-labelledby")).toStrictEqual(
      TOOLTIP
    );
    expect(progressSvg().outerHTML).toStrictEqual(
      expectedSvg(FULL_CIRCUMFERENCE, FULL_CIRCUMFERENCE)
    );
  });

  it("render half", () => {
    value = 50;
    renderComponent();

    expect(progressDiv().getAttribute("aria-labelledby")).toStrictEqual(
      TOOLTIP
    );
    expect(progressSvg().outerHTML).toStrictEqual(
      expectedSvg(FULL_CIRCUMFERENCE, HALF_CIRCUMFERENCE)
    );
  });

  it("render all", () => {
    value = 100;
    renderComponent();

    expect(progressDiv().getAttribute("aria-labelledby")).toStrictEqual(
      TOOLTIP
    );
    expect(progressSvg().outerHTML).toStrictEqual(
      expectedSvg(FULL_CIRCUMFERENCE, "0.0")
    );
  });

  const progressDiv = () => container.querySelector(".nav-menu-item-progress");
  const progressSvg = () =>
    container.querySelector(".nav-menu-item-progress svg");

  function renderComponent() {
    act(() => {
      render(
        <CircularProgressWithLabel
          value={value}
          tooltip={TOOLTIP}
          label={LABEL}
        />,
        container
      );
    });
  }
});
