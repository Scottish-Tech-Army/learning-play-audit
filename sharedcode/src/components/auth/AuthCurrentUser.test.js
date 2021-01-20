import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { AuthCurrentUser } from "./AuthCurrentUser";
import { getAuthStore } from "../../model/AuthStore";
import { Provider } from "react-redux";
import { SET_AUTH_STATE } from "../../model/AuthActionTypes";
import { SIGNED_IN, SIGNED_OUT } from "../../model/AuthStates";

const authStore = getAuthStore();

describe("component AuthCurrentUser", () => {
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

  it("signed in", () => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_IN,
      user: { attributes: { email: "test@example.com" } },
    });
    renderComponent();

    expect(
      container.querySelector(".auth-current-user .email").textContent
    ).toStrictEqual("test@example.com");
  });

  it("not signed in", () => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_OUT,
      user: { attributes: { email: "test@example.com" } },
    });
    renderComponent();

    expect(container.querySelector(".auth-current-user")).toBeNull();
  });

  function renderComponent() {
    act(() => {
      render(
        <Provider store={authStore}>
          <AuthCurrentUser />
        </Provider>,
        container
      );
    });
  }
});
