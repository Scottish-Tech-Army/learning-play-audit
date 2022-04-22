import React from "react";
import ConfirmSignIn from "./ConfirmSignIn";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import {
  SIGN_IN,
  CONFIRM_SIGN_IN,
  MFA_OPTION_TOTP,
  MFA_OPTION_SMS,
  SOFTWARE_TOKEN_MFA,
} from "../../model/AuthStates";
import { confirmSignIn, setAuthState } from "../../model/AuthActions";
import { authStore } from "../../setupTests";
import { renderWithStore } from "./TestUtils";
import { waitFor } from "@testing-library/dom";

const TEST_USER = "test@example.com";
const TEST_CODE = "65431";

jest.mock("../../model/AuthActions");

describe("component ConfirmSignIn", () => {
  beforeEach(() => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: CONFIRM_SIGN_IN,
      surveyUser: { username: TEST_USER, cognitoUser: {} },
    });

    (confirmSignIn as jest.Mock).mockImplementation(() => () => "dummy action");
    (setAuthState as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("initial render and code entry - SMS", async () => {
    const { container, getByLabelText, getByRole, user } = renderWithStore(
      <ConfirmSignIn />
    );
    expect(getByRole("heading", { level: 2 })).toHaveTextContent(
      "Confirm SMS Code"
    );
    const codeInput = getByLabelText("Code");
    const confirmButton = container.querySelector("#confirm-button");
    expect(codeInput).toHaveDisplayValue("");
    expect(confirmButton).toBeDisabled();

    await user.type(codeInput, TEST_CODE);
    expect(confirmButton).not.toBeDisabled();
  });

  it("initial render and code entry - TOTP", async () => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: CONFIRM_SIGN_IN,
      surveyUser: {
        username: TEST_USER,
        cognitoUser: { challengeName: SOFTWARE_TOKEN_MFA },
      },
    });
    const { container, getByLabelText, getByRole, user } = renderWithStore(
      <ConfirmSignIn />
    );
    expect(getByRole("heading", { level: 2 })).toHaveTextContent(
      "Confirm TOTP Code"
    );
    const codeInput = getByLabelText("Code");
    const confirmButton = container.querySelector("#confirm-button");
    expect(codeInput).toHaveDisplayValue("");
    expect(confirmButton).toBeDisabled();

    await user.type(codeInput, TEST_CODE);
    expect(confirmButton).not.toBeDisabled();
  });

  it("confirm success - SMS", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ConfirmSignIn />
    );
    await user.type(getByLabelText("Code"), TEST_CODE);
    const confirmButton = container.querySelector("#confirm-button")!;
    await user.click(confirmButton);

    expect(confirmSignIn).toHaveBeenCalledTimes(1);
    expect(confirmSignIn).toHaveBeenCalledWith(
      { username: TEST_USER, cognitoUser: {} },
      TEST_CODE,
      MFA_OPTION_SMS
    );
    expect(confirmButton).toBeDisabled();
  });

  it("confirm success - TOTP", async () => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: CONFIRM_SIGN_IN,
      surveyUser: {
        username: TEST_USER,
        cognitoUser: { challengeName: SOFTWARE_TOKEN_MFA },
      },
    });
    const { container, getByLabelText, user } = renderWithStore(
      <ConfirmSignIn />
    );
    await user.type(getByLabelText("Code"), TEST_CODE);
    const confirmButton = container.querySelector("#confirm-button")!;
    await user.click(confirmButton);

    expect(confirmSignIn).toHaveBeenCalledTimes(1);
    expect(confirmSignIn).toHaveBeenCalledWith(
      {
        username: TEST_USER,
        cognitoUser: { challengeName: SOFTWARE_TOKEN_MFA },
      },
      TEST_CODE,
      MFA_OPTION_TOTP
    );
    expect(confirmButton).toBeDisabled();
  });

  it("back to sign in", async () => {
    const { getByRole, user } = renderWithStore(<ConfirmSignIn />);
    await user.click(getByRole("button", { name: "Back to Sign In" }));

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN, {
      username: TEST_USER,
      cognitoUser: {},
    });
  });

  it("end loading spinner on auth state update", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ConfirmSignIn />
    );
    await user.type(getByLabelText("Code"), TEST_CODE);
    const confirmButton = container.querySelector("#confirm-button")!;
    await user.click(confirmButton);
    expect(confirmButton).toBeDisabled();

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      surveyUser: { username: TEST_USER, cognitoUser: {} },
    });
    await waitFor(() => expect(confirmButton).not.toBeDisabled());
  });

  it("end loading spinner on auth error", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <ConfirmSignIn />
    );
    await user.type(getByLabelText("Code"), TEST_CODE);
    const confirmButton = container.querySelector("#confirm-button")!;
    await user.click(confirmButton);
    expect(confirmButton).toBeDisabled();

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    await waitFor(() => expect(confirmButton).not.toBeDisabled());
  });
});
