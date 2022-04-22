import React from "react";
import ForgotPasswordRequest from "./ForgotPasswordRequest";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import { SIGN_IN, FORGOT_PASSWORD_REQUEST } from "../../model/AuthStates";
import { setAuthState, forgotPasswordRequest } from "../../model/AuthActions";
import { renderWithStore } from "./TestUtils";
import { authStore } from "../../setupTests";
import { waitFor } from "@testing-library/dom";

const TEST_USER = "test@example.com";

const EMAIL_LABEL = "Email Address *";

jest.mock("../../model/AuthActions");

describe("component ForgotPasswordRequest", () => {
  beforeEach(() => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: FORGOT_PASSWORD_REQUEST,
      surveyUser: undefined,
    });

    (forgotPasswordRequest as jest.Mock).mockImplementation(
      () => () => "dummy action"
    );
    (setAuthState as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("initial render and enable password request action", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ForgotPasswordRequest />
    );
    const emailInput = getByLabelText(EMAIL_LABEL);
    const requestButton = container.querySelector("#request-button");

    expect(emailInput).toHaveDisplayValue("");
    expect(requestButton).toBeDisabled();

    // Form complete
    await user.type(emailInput, TEST_USER);
    expect(requestButton).not.toBeDisabled();

    // Email empty
    await user.clear(emailInput);
    expect(requestButton).toBeDisabled();

    // Restore
    await user.type(emailInput, TEST_USER);
    expect(requestButton).not.toBeDisabled();
  });

  it("request success", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ForgotPasswordRequest />
    );
    const requestButton = container.querySelector("#request-button")!;
    await user.type(getByLabelText(EMAIL_LABEL), TEST_USER);
    await user.click(requestButton);

    expect(forgotPasswordRequest).toHaveBeenCalledTimes(1);
    expect(forgotPasswordRequest).toHaveBeenCalledWith(TEST_USER);
    expect(requestButton).toBeDisabled();
  });

  it("back to sign in", async () => {
    const { getByRole, user } = renderWithStore(
      <ForgotPasswordRequest />
    );
    await user.click(getByRole("button", { name: "Back to Sign In" }));

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN);
  });

  it("end loading spinner on auth state update", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ForgotPasswordRequest />
    );
    const requestButton = container.querySelector("#request-button")!;
    await user.type(getByLabelText(EMAIL_LABEL), TEST_USER);
    await user.click(requestButton);

    expect(requestButton).toBeDisabled();

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      surveyUser: undefined,
    });
    await waitFor(() => expect(requestButton).not.toBeDisabled());
  });

  it("end loading spinner on auth error", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ForgotPasswordRequest />
    );
    const requestButton = container.querySelector("#request-button")!;
    await user.type(getByLabelText(EMAIL_LABEL), TEST_USER);
    await user.click(requestButton);

    expect(requestButton).toBeDisabled();

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    await waitFor(() => expect(requestButton).not.toBeDisabled());
  });
});
