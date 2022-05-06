import React from "react";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import { renderWithStore } from "./ReactTestUtils";

describe("component CircularProgressWithLabel", () => {
  const TOOLTIP = "test tooltip";
  const LABEL = "test label";

  const FULL_CIRCUMFERENCE = "131.9";
  const HALF_CIRCUMFERENCE = "66.0";

  // Validating against the whole SVG is brittle, but the alternative would effectively replicate the production code
  const expectedSvg = (dashArrayLength: string, dashOffsetLength: string) =>
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
    const { container } = renderWithStore(
      <CircularProgressWithLabel value={0} tooltip={TOOLTIP} label={LABEL} />
    );

    expect(container.querySelector(".nav-menu-item-progress")).toHaveAttribute(
      "aria-labelledby",
      TOOLTIP
    );
    expect(
      container.querySelector(".nav-menu-item-progress svg")!.outerHTML
    ).toStrictEqual(expectedSvg(FULL_CIRCUMFERENCE, FULL_CIRCUMFERENCE));
  });

  it("render half", () => {
    const { container } = renderWithStore(
      <CircularProgressWithLabel value={50} tooltip={TOOLTIP} label={LABEL} />
    );

    expect(
      container.querySelector(".nav-menu-item-progress svg")!.outerHTML
    ).toStrictEqual(expectedSvg(FULL_CIRCUMFERENCE, HALF_CIRCUMFERENCE));
  });

  it("render all", () => {
    const { container } = renderWithStore(
      <CircularProgressWithLabel value={100} tooltip={TOOLTIP} label={LABEL} />
    );
    expect(
      container.querySelector(".nav-menu-item-progress svg")!.outerHTML
    ).toStrictEqual(expectedSvg(FULL_CIRCUMFERENCE, "0.0"));
  });
});
