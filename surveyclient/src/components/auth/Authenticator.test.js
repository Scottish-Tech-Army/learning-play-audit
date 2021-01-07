/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkAuthStateTitle"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import Authenticator from "./Authenticator";
import surveyStore from "../../model/SurveyModel";
import { Provider } from "react-redux";
import { SET_AUTH_STATE } from "../../model/ActionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  SIGNED_OUT,
  REGISTER,
  CONFIRM_REGISTRATION,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUBMIT,
  RESET_PASSWORD,
} from "../../model/AuthStates";
import { setAuthState, signInCurrentUser } from "../../model/AuthActions";

const TEST_USER = "test@example.com";

jest.mock("../../model/AuthActions");

describe("component Authenticator", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: REGISTER,
      user: { username: TEST_USER },
    });

    signInCurrentUser.mockReset();
    signInCurrentUser.mockImplementation(() => () => Promise.resolve({}));
    setAuthState.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("states without visuals", () => {
    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_OUT,
      user: { username: TEST_USER },
    });
    renderComponent();
    expect(authenticatorSection()).toBeNull();

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_IN,
      user: { username: TEST_USER },
    });
    renderComponent();
    expect(authenticatorSection()).toBeNull();

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: "unknown",
      user: { username: TEST_USER },
    });
    renderComponent();
    expect(authenticatorTitle()).toBeNull();
  });

  it("states with visuals", () => {
    checkAuthStateTitle(SIGN_IN, "Login");
    checkAuthStateTitle(REGISTER, "Register");
    checkAuthStateTitle(CONFIRM_REGISTRATION, "Confirm Sign up");
    checkAuthStateTitle(FORGOT_PASSWORD_REQUEST, "Reset your password");
    checkAuthStateTitle(FORGOT_PASSWORD_SUBMIT, "Confirm password reset");
    checkAuthStateTitle(RESET_PASSWORD, "Change Password");
  });

  it("initial effect check", () => {
    renderComponent();
    expect(signInCurrentUser).toHaveBeenCalledTimes(1);
  });

  function checkAuthStateTitle(authState, expectedTitle) {
    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: authState,
      user: { username: TEST_USER },
    });
    renderComponent();
    expect(authenticatorSection()).not.toBeNull();
    expect(authenticatorTitle()).toHaveTextContent(expectedTitle);
  }

  const authenticatorSection = () =>
    container.querySelector(".section.authenticator");
  const authenticatorTitle = () =>
    container.querySelector(".section.authenticator h2");

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <Authenticator />
        </Provider>,
        container
      );
    });
  }
});
