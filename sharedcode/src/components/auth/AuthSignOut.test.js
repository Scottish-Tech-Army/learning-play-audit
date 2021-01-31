import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { AuthSignOut } from "./AuthSignOut";
import { getAuthStore } from "../../model/AuthStore";
import { Provider } from "react-redux";
import { signOut } from "../../model/AuthActions";

const authStore = getAuthStore();

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

  it("signed out", () => {
    renderComponent();
    click(signOutButton());
    renderComponent();

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  const signOutButton = () => container.querySelector("#auth-signout");

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={authStore}>
          <AuthSignOut />
        </Provider>,
        container
      );
    });
  }
});
