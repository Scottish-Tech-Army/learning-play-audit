import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import SignIn from "./SignIn";
import surveyStore from "../../model/SurveyModel";
import { Provider } from "react-redux";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/ActionTypes";
import {
  SIGN_IN,
  SIGNED_IN,
  REGISTER,
  FORGOT_PASSWORD_REQUEST,
} from "../../model/AuthStates";
import { setAuthState, signIn } from "../../model/AuthActions";

const TEST_USER = "test@example.com";

jest.mock("../../model/AuthActions");

describe("component SignIn", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      user: { username: TEST_USER },
    });

    signIn.mockReset();
    setAuthState.mockReset();
    signIn.mockImplementation(() => () => "dummy action");
    setAuthState.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial render and enable signIn action", () => {
    renderComponent();
    expect(emailInput().value).toStrictEqual("");
    expect(passwordInput().value).toStrictEqual("");
    expect(signInButton()).toBeDisabled();

    // Form complete
    enterEmail(TEST_USER);
    enterPassword("12345678");
    renderComponent();
    expect(signInButton()).not.toBeDisabled();

    // Email empty
    enterEmail("");
    renderComponent();
    expect(signInButton()).toBeDisabled();

    // Restore
    enterEmail(TEST_USER);
    renderComponent();
    expect(signInButton()).not.toBeDisabled();

    // Password empty
    enterPassword("");
    renderComponent();
    expect(signInButton()).toBeDisabled();

    // Restore
    enterPassword("12345678");
    renderComponent();
    expect(signInButton()).not.toBeDisabled();
  });

  it("confirm success", () => {
    renderComponent();
    enterEmail(TEST_USER);
    enterPassword("12345678");
    renderComponent();
    click(signInButton());

    expect(signIn).toHaveBeenCalledTimes(1);
    expect(signIn).toHaveBeenCalledWith(TEST_USER, "12345678");
    renderComponent();
    expect(signInButton()).toBeDisabled();
  });

  it("go to register", () => {
    renderComponent();
    click(registerButton());

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(REGISTER);
  });

  it("go to forgot password", () => {
    renderComponent();
    click(forgotPasswordButton());

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(FORGOT_PASSWORD_REQUEST);
  });

  it("end loading spinner on auth state update", () => {
    renderComponent();
    enterEmail(TEST_USER);
    enterPassword("12345678");
    renderComponent();
    click(signInButton());
    renderComponent();
    expect(signInButton()).toBeDisabled();

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_IN,
      user: { username: TEST_USER },
    });
    renderComponent();
    expect(signInButton()).not.toBeDisabled();
  });

  it("end loading spinner on auth error", () => {
    renderComponent();
    enterEmail(TEST_USER);
    enterPassword("12345678");
    renderComponent();
    click(signInButton());
    renderComponent();
    expect(signInButton()).toBeDisabled();

    surveyStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    renderComponent();
    expect(signInButton()).not.toBeDisabled();
  });

  const emailInput = () => container.querySelector("#emailInput");
  const passwordInput = () => container.querySelector("#passwordInput");
  const registerButton = () => container.querySelector("#register-button");
  const forgotPasswordButton = () =>
    container.querySelector("#forgot-password-button");
  const signInButton = () => container.querySelector("#signin-button");

  function enterEmail(value) {
    act(() => {
      const element = emailInput();
      element.value = value;
      Simulate.input(element);
    });
  }

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
        <Provider store={surveyStore}>
          <SignIn />
        </Provider>,
        container
      );
    });
  }
});
