import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import RequireNewPassword from "./RequireNewPassword";
import surveyStore from "../../model/SurveyModel";
import { Provider } from "react-redux";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  REFRESH_STATE,
} from "../../model/ActionTypes";
import { SIGN_IN, SIGNED_OUT, RESET_PASSWORD } from "../../model/AuthStates";
import { setAuthState, completeNewPassword } from "../../model/AuthActions";

const TEST_USER = "test@example.com";

jest.mock("../../model/AuthActions");

describe("component RequireNewPassword", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    surveyStore.dispatch({
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

  it("initial render and enable change action - first login", () => {
    renderComponent();
    expect(passwordInput().value).toStrictEqual("");
    expect(changeButton()).toBeDisabled();
    expect(continueButton()).toBeNull();

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

    surveyStore.dispatch({
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

    surveyStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    renderComponent();
    expect(changeButton()).not.toBeDisabled();
  });

  it("not first login can continue", () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        hasEverLoggedIn: true,
        authentication: {
          errorMessage: "",
          state: RESET_PASSWORD,
          user: { username: TEST_USER },
        },
      },
    });
    renderComponent();

    expect(continueButton()).not.toBeNull();
    click(continueButton());

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGNED_OUT);
  });

  const passwordInput = () => container.querySelector("#passwordInput");
  const changeButton = () => container.querySelector("#change-button");
  const signInButton = () => container.querySelector("#signin-button");
  const continueButton = () =>
    container.querySelector("#continue-signed-out-button");

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
          <RequireNewPassword />
        </Provider>,
        container
      );
    });
  }
});
