import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import AuthSignOut from "./AuthSignOut";
import surveyStore from "../../model/SurveyModel";
import { Provider } from "react-redux";
import { signOut } from "../../model/AuthActions";

jest.mock("../../model/AuthActions");

describe("component AuthSignOut", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    signOut.mockReset();
    signOut.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("confirm dialog appears", () => {
    renderComponent();
    expect(confirmYesButton()).toBeNull();

    click(signOutButton());
    expect(confirmYesButton()).not.toBeNull();
  });

  it("signed out cancel", () => {
    renderComponent();
    click(signOutButton());
    renderComponent();

    click(confirmNoButton());
    renderComponent();

    expect(confirmYesButton()).toBeNull();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("signed out cancel click background", () => {
    renderComponent();
    click(signOutButton());
    renderComponent();

    click(backdrop());
    renderComponent();

    expect(confirmYesButton()).toBeNull();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("signed out confirm", () => {
    renderComponent();
    click(signOutButton());
    renderComponent();

    click(confirmYesButton());
    renderComponent();

    expect(confirmYesButton()).toBeNull();
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  const signOutButton = () => container.querySelector("#auth-signout");

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
      render(
        <Provider store={surveyStore}>
          <AuthSignOut />
        </Provider>,
        container
      );
    });
  }
});
