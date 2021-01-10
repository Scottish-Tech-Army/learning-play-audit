import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import ForgotPasswordSubmit from "./ForgotPasswordSubmit";
import surveyStore from "../../model/SurveyModel";
import { Provider } from "react-redux";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  REFRESH_STATE,
} from "../../model/ActionTypes";
import { SIGN_IN, SIGNED_OUT, FORGOT_PASSWORD_SUBMIT } from "../../model/AuthStates";
import { setAuthState, forgotPasswordSubmit } from "../../model/AuthActions";

const TEST_USER = "test@example.com";

jest.mock("../../model/AuthActions");

describe("component ForgotPasswordSubmit", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: FORGOT_PASSWORD_SUBMIT,
      user: { username: TEST_USER },
    });

    forgotPasswordSubmit.mockReset();
    setAuthState.mockReset();
    forgotPasswordSubmit.mockImplementation(() => () => "dummy action");
    setAuthState.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial render and enable submit action - first login", () => {
    renderComponent();
    expect(emailInput().value).toStrictEqual(TEST_USER);
    expect(codeInput().value).toStrictEqual("");
    expect(passwordInput().value).toStrictEqual("");
    expect(submitButton()).toBeDisabled();
    expect(continueButton()).toBeNull();

    // Form complete
    enterCode("123456");
    enterPassword("12345678");
    renderComponent();
    expect(submitButton()).not.toBeDisabled();

    // Code empty
    enterCode("");
    renderComponent();
    expect(submitButton()).toBeDisabled();

    // Restore
    enterCode("123456");
    renderComponent();
    expect(submitButton()).not.toBeDisabled();

    // Password empty
    enterPassword("");
    renderComponent();
    expect(submitButton()).toBeDisabled();

    // Restore
    enterPassword("12345678");
    renderComponent();
    expect(submitButton()).not.toBeDisabled();

    // Password too short
    enterPassword("1234567");
    renderComponent();
    expect(submitButton()).toBeDisabled();

    // Restore
    enterPassword("12345678");
    renderComponent();
    expect(submitButton()).not.toBeDisabled();
  });

  it("render missing user", () => {
      surveyStore.dispatch({
        type: SET_AUTH_STATE,
        authState: FORGOT_PASSWORD_SUBMIT,
        user: {},
      });
      renderComponent();
      expect(emailInput().value).toStrictEqual("");

      surveyStore.dispatch({
        type: SET_AUTH_STATE,
        authState: FORGOT_PASSWORD_SUBMIT,
        user: undefined,
      });
      renderComponent();
      expect(emailInput().value).toStrictEqual("");
  });

  it("confirm success", () => {
    renderComponent();
    enterCode("123456");
    enterPassword("12345678");
    renderComponent();
    click(submitButton());

    expect(forgotPasswordSubmit).toHaveBeenCalledTimes(1);
    expect(forgotPasswordSubmit).toHaveBeenCalledWith(TEST_USER, "123456", "12345678");
    renderComponent();
    expect(submitButton()).toBeDisabled();
  });

  it("back to sign in", () => {
    renderComponent();
    click(signInButton());

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN);
  });

  it("end loading spinner on auth state update", () => {
    renderComponent();
    enterCode("123456");
    enterPassword("12345678");
    renderComponent();
    click(submitButton());
    renderComponent();
    expect(submitButton()).toBeDisabled();

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      user: { username: TEST_USER },
    });
    renderComponent();
    expect(submitButton()).not.toBeDisabled();
  });

  it("end loading spinner on auth error", () => {
    renderComponent();
    enterCode("123456");
    enterPassword("12345678");
    renderComponent();
    click(submitButton());
    renderComponent();
    expect(submitButton()).toBeDisabled();

    surveyStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    renderComponent();
    expect(submitButton()).not.toBeDisabled();
  });

  it("not first login can continue", () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        hasEverLoggedIn: true,
        authentication: {
          errorMessage: "",
          state: FORGOT_PASSWORD_SUBMIT,
          user: undefined,
        },
      },
    });
    renderComponent();

    expect(continueButton()).not.toBeNull();
    click(continueButton());

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGNED_OUT);
  });


  const emailInput = () => container.querySelector("#emailInput");
  const codeInput = () => container.querySelector("#codeInput");
  const passwordInput = () => container.querySelector("#passwordInput");
  const submitButton = () => container.querySelector("#submit-button");
  const signInButton = () => container.querySelector("#signin-button");
  const continueButton = () =>
    container.querySelector("#continue-signed-out-button");

  function enterCode(value) {
    act(() => {
      const element = codeInput();
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
          <ForgotPasswordSubmit />
        </Provider>,
        container
      );
    });
  }
});
