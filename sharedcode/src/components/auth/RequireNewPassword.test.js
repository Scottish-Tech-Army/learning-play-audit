import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import RequireNewPassword from "./RequireNewPassword";
import { getAuthStore } from "../../model/AuthStore";
import { Provider } from "react-redux";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import { SIGN_IN, RESET_PASSWORD } from "../../model/AuthStates";
import { setAuthState, completeNewPassword } from "../../model/AuthActions";

const TEST_USER = "test@example.com";

const authStore = getAuthStore();

jest.mock("../../model/AuthActions");

describe("component RequireNewPassword", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: RESET_PASSWORD,
      user: { username: TEST_USER },
    });

    completeNewPassword.mockReset();
    setAuthState.mockReset();
    completeNewPassword.mockImplementation(() => () => "dummy action");
    setAuthState.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial render and enable change actionn", () => {
    renderComponent();
    expect(passwordInput().value).toStrictEqual("");
    expect(changeButton()).toBeDisabled();

    // Form complete
    enterPassword("12345678");
    renderComponent();
    expect(changeButton()).not.toBeDisabled();

    // Password empty
    enterPassword("");
    renderComponent();
    expect(changeButton()).toBeDisabled();

    // Restore
    enterPassword("12345678");
    renderComponent();
    expect(changeButton()).not.toBeDisabled();

    // Password too short
    enterPassword("1234567");
    renderComponent();
    expect(changeButton()).toBeDisabled();

    // Restore
    enterPassword("12345678");
    renderComponent();
    expect(changeButton()).not.toBeDisabled();
  });

  it("change success", () => {
    renderComponent();
    enterPassword("new password");
    renderComponent();
    click(changeButton());

    expect(completeNewPassword).toHaveBeenCalledTimes(1);
    expect(completeNewPassword).toHaveBeenCalledWith(
      { username: TEST_USER },
      "new password"
    );
    renderComponent();
    expect(changeButton()).toBeDisabled();
  });

  it("back to sign in", () => {
    renderComponent();
    click(signInButton());

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN, { username: TEST_USER });
  });

  it("end loading spinner on auth state update", () => {
    renderComponent();
    enterPassword("new password");
    renderComponent();
    click(changeButton());
    renderComponent();
    expect(changeButton()).toBeDisabled();

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      user: { username: TEST_USER },
    });
    renderComponent();
    expect(changeButton()).not.toBeDisabled();
  });

  it("end loading spinner on auth error", () => {
    renderComponent();
    enterPassword("new password");
    renderComponent();
    click(changeButton());
    renderComponent();
    expect(changeButton()).toBeDisabled();

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    renderComponent();
    expect(changeButton()).not.toBeDisabled();
  });

  const passwordInput = () => container.querySelector("#passwordInput");
  const changeButton = () => container.querySelector("#change-button");
  const signInButton = () => container.querySelector("#signin-button");

  function enterPassword(value) {
    act(() => {
      const element = passwordInput();
      element.value = value;
      Simulate.input(element);
    });
  }

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={authStore}>
          <RequireNewPassword />
        </Provider>,
        container
      );
    });
  }
});
