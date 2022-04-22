import React from "react";
import ConfirmRegistration from "./ConfirmRegistration";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import { SIGN_IN, CONFIRM_REGISTRATION } from "../../model/AuthStates";
import {
  resendConfirmCode,
  confirmRegistration,
  setAuthState,
} from "../../model/AuthActions";
import { authStore } from "../../setupTests";
import { renderWithStore } from "./TestUtils";
import { waitFor } from "@testing-library/dom";

const TEST_USER = "test@example.com";
const TEST_CODE = "65431";
const TEST_PASSWORD = "test password";

const CODE_LABEL =
  "Confirmation Code (please check your email inbox including your junk/spam mail)";

jest.mock("../../model/AuthActions");

describe("component ConfirmRegistration", () => {
  beforeEach(() => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: CONFIRM_REGISTRATION,
      surveyUser: { username: TEST_USER },
    });

    (resendConfirmCode as jest.Mock).mockImplementation(
      () => () => "dummy action"
    );
    (confirmRegistration as jest.Mock).mockImplementation(
      () => () => "dummy action"
    );
    (setAuthState as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("initial render and code entry", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ConfirmRegistration />
    );
    expect(getByLabelText("Email Address")).toHaveDisplayValue(TEST_USER);

    const codeInput = getByLabelText(CODE_LABEL);
    const confirmButton = container.querySelector("#confirm-button");

    expect(codeInput).toHaveDisplayValue("");
    expect(confirmButton).toBeDisabled();

    await user.type(codeInput, TEST_CODE);

    expect(confirmButton).not.toBeDisabled();
  });

  it("confirm success", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ConfirmRegistration />
    );
    await user.type(getByLabelText(CODE_LABEL), TEST_CODE);
    const confirmButton = container.querySelector("#confirm-button")!;
    await user.click(confirmButton);

    expect(confirmRegistration).toHaveBeenCalledTimes(1);
    expect(confirmRegistration).toHaveBeenCalledWith(
      { username: TEST_USER },
      TEST_CODE
    );
    expect(confirmButton).toBeDisabled();
  });

  it("confirm success with signUpAttrs", async () => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: CONFIRM_REGISTRATION,
      surveyUser: {
        username: TEST_USER,
        signUpAttrs: { password: TEST_PASSWORD },
      },
    });

    const { container, getByLabelText, user } = renderWithStore(
      <ConfirmRegistration />
    );
    await user.type(getByLabelText(CODE_LABEL), TEST_CODE);
    const confirmButton = container.querySelector("#confirm-button")!;
    await user.click(confirmButton);

    expect(confirmRegistration).toHaveBeenCalledTimes(1);
    expect(confirmRegistration).toHaveBeenCalledWith(
      { username: TEST_USER, signUpAttrs: { password: TEST_PASSWORD } },
      TEST_CODE
    );
    expect(confirmButton).toBeDisabled();
  });

  it("resend confirm code", async () => {
    const { getByRole, user } = renderWithStore(<ConfirmRegistration />);
    await user.click(getByRole("button", { name: "Resend Code" }));

    expect(resendConfirmCode).toHaveBeenCalledTimes(1);
    expect(resendConfirmCode).toHaveBeenCalledWith({ username: TEST_USER });
  });

  it("back to sign in", async () => {
    const { getByRole, user } = renderWithStore(<ConfirmRegistration />);
    await user.click(getByRole("button", { name: "Back to Sign In" }));

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN, { username: TEST_USER });
  });

  it("end loading spinner on auth state update", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ConfirmRegistration />
    );
    await user.type(getByLabelText(CODE_LABEL), TEST_CODE);
    const confirmButton = container.querySelector("#confirm-button")!;
    await user.click(confirmButton);
    expect(confirmButton).toBeDisabled();

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      surveyUser: { username: TEST_USER },
    });
    await waitFor(() => expect(confirmButton).not.toBeDisabled());
  });

  it("end loading spinner on auth error", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ConfirmRegistration />
    );
    await user.type(getByLabelText(CODE_LABEL), TEST_CODE);
    const confirmButton = container.querySelector("#confirm-button")!;
    await user.click(confirmButton);
    expect(confirmButton).toBeDisabled();

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    await waitFor(() => expect(confirmButton).not.toBeDisabled());
  });
});
