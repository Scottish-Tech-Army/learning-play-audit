import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import ConfirmSignIn from "./ConfirmSignIn";
import { getAuthStore } from "../../model/AuthStore";
import { Provider } from "react-redux";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import {
  SIGN_IN,
  CONFIRM_SIGN_IN,
  MFA_OPTION_TOTP,
  MFA_OPTION_SMS,
  SOFTWARE_TOKEN_MFA,
} from "../../model/AuthStates";
import { confirmSignIn, setAuthState } from "../../model/AuthActions";

const TEST_USER = "test@example.com";
const TEST_CODE = "65431";

const authStore = getAuthStore();

jest.mock("../../model/AuthActions");

describe("component ConfirmSignIn", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: CONFIRM_SIGN_IN,
      user: { username: TEST_USER },
    });

    confirmSignIn.mockReset();
    setAuthState.mockReset();
    confirmSignIn.mockImplementation(() => () => "dummy action");
    setAuthState.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial render and code entry - SMS", () => {
    renderComponent();
    expect(heading()).toHaveTextContent("Confirm SMS Code");
    expect(codeInput().value).toStrictEqual("");
    expect(confirmButton()).toBeDisabled();

    enterCode(TEST_CODE);
    renderComponent();
    expect(confirmButton()).not.toBeDisabled();
  });

  it("initial render and code entry - TOTP", () => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: CONFIRM_SIGN_IN,
      user: { username: TEST_USER, challengeName: SOFTWARE_TOKEN_MFA },
    });
    renderComponent();
    expect(heading()).toHaveTextContent("Confirm TOTP Code");
    expect(codeInput().value).toStrictEqual("");
    expect(confirmButton()).toBeDisabled();

    enterCode(TEST_CODE);
    renderComponent();
    expect(confirmButton()).not.toBeDisabled();
  });

  it("confirm success - SMS", () => {
    renderComponent();
    enterCode(TEST_CODE);
    renderComponent();
    click(confirmButton());

    expect(confirmSignIn).toHaveBeenCalledTimes(1);
    expect(confirmSignIn).toHaveBeenCalledWith(
      { username: TEST_USER },
      TEST_CODE,
      MFA_OPTION_SMS
    );
    renderComponent();
    expect(confirmButton()).toBeDisabled();
  });

  it("confirm success - TOTP", () => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: CONFIRM_SIGN_IN,
      user: { username: TEST_USER, challengeName: SOFTWARE_TOKEN_MFA },
    });
    renderComponent();
    enterCode(TEST_CODE);
    renderComponent();
    click(confirmButton());

    expect(confirmSignIn).toHaveBeenCalledTimes(1);
    expect(confirmSignIn).toHaveBeenCalledWith(
      { username: TEST_USER, challengeName: SOFTWARE_TOKEN_MFA },
      TEST_CODE,
      MFA_OPTION_TOTP
    );
    renderComponent();
    expect(confirmButton()).toBeDisabled();
  });

  it("back to sign in", () => {
    renderComponent();
    click(signInButton());

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN, { username: TEST_USER });
  });

  it("end loading spinner on auth state update", () => {
    renderComponent();
    enterCode(TEST_CODE);
    renderComponent();
    click(confirmButton());
    renderComponent();
    expect(confirmButton()).toBeDisabled();

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      user: { username: TEST_USER },
    });
    renderComponent();
    expect(confirmButton()).not.toBeDisabled();
  });

  it("end loading spinner on auth error", () => {
    renderComponent();
    enterCode(TEST_CODE);
    renderComponent();
    click(confirmButton());
    renderComponent();
    expect(confirmButton()).toBeDisabled();

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    renderComponent();
    expect(confirmButton()).not.toBeDisabled();
  });

  const heading = () => container.querySelector("h2");
  const codeInput = () => container.querySelector("#codeInput");
  const confirmButton = () => container.querySelector("#confirm-button");
  const signInButton = () => container.querySelector("#signin-button");

  function enterCode(value) {
    act(() => {
      const element = codeInput();
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
          <ConfirmSignIn />
        </Provider>,
        container
      );
    });
  }
});
