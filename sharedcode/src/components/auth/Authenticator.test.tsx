/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkAuthStateTitle"] }] */

import React from "react";
import { Authenticator } from "./Authenticator";
import { SET_AUTH_STATE } from "../../model/AuthActionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  CONFIRM_SIGN_IN,
  SIGNED_OUT,
  REGISTER,
  CONFIRM_REGISTRATION,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUBMIT,
  RESET_PASSWORD,
  TOTP_SETUP,
  AuthState,
} from "../../model/AuthStates";
import {
  setAuthState,
  signInCurrentUser,
  getTOTPSetupQrCode,
} from "../../model/AuthActions";
import { renderWithStore } from "./TestUtils";
import { authStore } from "../../setupTests";

const TEST_EMAIL = "test@example.com";

jest.mock("../../model/AuthActions");

describe("component Authenticator", () => {
  beforeEach(() => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: REGISTER,
      surveyUser: { email: TEST_EMAIL, cognitoUser: {} },
    });

    (signInCurrentUser as jest.Mock).mockImplementation(
      () => () => Promise.resolve({})
    );
    (getTOTPSetupQrCode as jest.Mock).mockImplementation(() =>
      Promise.resolve("")
    );
    (setAuthState as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("states without visuals - SIGNED_OUT", () => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_OUT,
      surveyUser: { email: TEST_EMAIL },
    });
    const { container } = renderWithStore(<Authenticator />);
    expect(authenticatorSection(container)).toBeNull();
  });

  it("states without visual - SIGNED_IN", () => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_IN,
      surveyUser: { email: TEST_EMAIL },
    });
    const { container } = renderWithStore(<Authenticator />);
    expect(authenticatorSection(container)).toBeNull();
  });

  it("states with visuals - SIGN_IN", () => {
    checkAuthStateTitle(SIGN_IN, "Login");
  });

  it("states with visuals - CONFIRM_SIGN_IN", () => {
    checkAuthStateTitle(CONFIRM_SIGN_IN, "Confirm SMS Code");
  });

  it("states with visuals - REGISTER", () => {
    checkAuthStateTitle(REGISTER, "Register");
  });

  it("states with visuals - CONFIRM_REGISTRATION", () => {
    checkAuthStateTitle(CONFIRM_REGISTRATION, "Confirm Sign up");
  });

  it("states with visuals - FORGOT_PASSWORD_REQUEST", () => {
    checkAuthStateTitle(FORGOT_PASSWORD_REQUEST, "Reset your password");
  });

  it("states with visuals - FORGOT_PASSWORD_SUBMIT", () => {
    checkAuthStateTitle(FORGOT_PASSWORD_SUBMIT, "Confirm password reset");
  });

  it("states with visuals - RESET_PASSWORD", () => {
    checkAuthStateTitle(RESET_PASSWORD, "Change Password");
  });

  it("states with visuals - TOTP_SETUP", () => {
    checkAuthStateTitle(TOTP_SETUP, "Scan then enter verification code");
  });

  it("initial effect check", () => {
    renderWithStore(<Authenticator />);
    expect(signInCurrentUser).toHaveBeenCalledTimes(1);
  });

  function checkAuthStateTitle(authState: AuthState, expectedTitle: string) {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState,
      surveyUser: { email: TEST_EMAIL, cognitoUser: {} },
    });
    const { container } = renderWithStore(<Authenticator />);
    expect(authenticatorSection(container)).not.toBeNull();
    expect(authenticatorTitle(container)).toHaveTextContent(expectedTitle);
  }

  const authenticatorSection = (container: HTMLElement) =>
    container.querySelector(".section.authenticator");
  const authenticatorTitle = (container: HTMLElement) =>
    container.querySelector(".section.authenticator h2");
});
