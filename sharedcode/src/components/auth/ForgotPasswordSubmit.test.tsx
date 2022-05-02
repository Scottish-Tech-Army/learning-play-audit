import React from "react";
import ForgotPasswordSubmit from "./ForgotPasswordSubmit";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import { SIGN_IN, FORGOT_PASSWORD_SUBMIT } from "../../model/AuthStates";
import { setAuthState, forgotPasswordSubmit } from "../../model/AuthActions";
import { renderWithStore } from "./TestUtils";
import { authStore } from "../../setupTests";
import { waitFor } from "@testing-library/dom";

const TEST_EMAIL = "test@example.com";

jest.mock("../../model/AuthActions");

describe("component ForgotPasswordSubmit", () => {
  beforeEach(() => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: FORGOT_PASSWORD_SUBMIT,
      surveyUser: { email: TEST_EMAIL },
    });

    (forgotPasswordSubmit as jest.Mock).mockImplementation(
      () => () => "dummy action"
    );
    (setAuthState as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("initial render and enable submit action", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ForgotPasswordSubmit />
    );
    expect(getByLabelText("Email Address")).toHaveDisplayValue(TEST_EMAIL);

    const codeInput = getByLabelText("Verification code");
    const passwordInput = getByLabelText("New password");
    const submitButton = container.querySelector("#submit-button");

    expect(codeInput).toHaveDisplayValue("");
    expect(passwordInput).toHaveDisplayValue("");
    expect(submitButton).toBeDisabled();

    // Form complete
    await user.type(codeInput, "123456");
    await user.type(passwordInput, "12345678");
    expect(submitButton).not.toBeDisabled();

    // Code empty
    await user.clear(codeInput);
    expect(submitButton).toBeDisabled();

    // Restore
    await user.type(codeInput, "123456");
    expect(submitButton).not.toBeDisabled();

    // Password empty
    await user.clear(passwordInput);
    expect(submitButton).toBeDisabled();

    // Restore
    await user.type(passwordInput, "12345678");
    expect(submitButton).not.toBeDisabled();

    // Password too short
    await user.clear(passwordInput);
    await user.type(passwordInput, "1234567");
    expect(submitButton).toBeDisabled();

    // Restore
    await user.type(passwordInput, "12345678");
    expect(submitButton).not.toBeDisabled();
  });

  it("confirm success", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ForgotPasswordSubmit />
    );
    await user.type(getByLabelText("Verification code"), "123456");
    await user.type(getByLabelText("New password"), "12345678");

    const submitButton = container.querySelector("#submit-button")!;
    await user.click(submitButton);

    expect(forgotPasswordSubmit).toHaveBeenCalledTimes(1);
    expect(forgotPasswordSubmit).toHaveBeenCalledWith(
      TEST_EMAIL,
      "123456",
      "12345678"
    );
    expect(submitButton).toBeDisabled();
  });

  it("back to sign in", async () => {
    const { getByRole, user } = renderWithStore(<ForgotPasswordSubmit />);
    await user.click(getByRole("button", { name: "Back to Sign In" }));

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN);
  });

  it("end loading spinner on auth state update", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ForgotPasswordSubmit />
    );
    await user.type(getByLabelText("Verification code"), "123456");
    await user.type(getByLabelText("New password"), "12345678");

    const submitButton = container.querySelector("#submit-button")!;
    await user.click(submitButton);
    expect(submitButton).toBeDisabled();

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      surveyUser: { email: TEST_EMAIL },
    });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });

  it("end loading spinner on auth error", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ForgotPasswordSubmit />
    );
    await user.type(getByLabelText("Verification code"), "123456");
    await user.type(getByLabelText("New password"), "12345678");

    const submitButton = container.querySelector("#submit-button")!;
    await user.click(submitButton);
    expect(submitButton).toBeDisabled();

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });
});
