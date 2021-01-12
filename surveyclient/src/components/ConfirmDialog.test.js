import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import ConfirmDialog from "./ConfirmDialog";

var closeDialogResponse = null;
function closeDialog(value) {
  closeDialogResponse = value;
}
describe("component ConfirmDialog", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    closeDialogResponse = null;
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("render default buttons", () => {
    renderComponent();

    expect(confirmYesButton().textContent).toStrictEqual("YES");
    expect(confirmNoButton().textContent).toStrictEqual("NO");
  });

  it("render custom buttons", () => {
      act(() => {
        render(<ConfirmDialog closeDialog={closeDialog} yesText="test yes" noText="test no" />, container);
      });

    expect(confirmYesButton().textContent).toStrictEqual("test yes");
    expect(confirmNoButton().textContent).toStrictEqual("test no");
  });

  it("cancel", () => {
    renderComponent();

    click(confirmNoButton());

    expect(closeDialogResponse).toStrictEqual(false);
  });

  it("cancel click background", () => {
    renderComponent();

    click(backdrop());

    expect(closeDialogResponse).toStrictEqual(false);
  });

  it("confirm", () => {
    renderComponent();

    click(confirmYesButton());

    expect(closeDialogResponse).toStrictEqual(true);
  });

  const confirmYesButton = () => document.querySelector(".dialog #yes-button");
  const confirmNoButton = () => document.querySelector(".dialog #no-button");
  const backdrop = () =>
    document.querySelector("#dialog-container div:first-child");

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function renderComponent() {
    act(() => {
      render(<ConfirmDialog closeDialog={closeDialog} />, container);
    });
  }
});
