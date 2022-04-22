import React from "react";
import RequireNewPassword from "./RequireNewPassword";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import { SIGN_IN, RESET_PASSWORD } from "../../model/AuthStates";
import { setAuthState, completeNewPassword } from "../../model/AuthActions";
import { renderWithStore } from "./TestUtils";
import { authStore } from "../../setupTests";
import { waitFor } from "@testing-library/react";

const TEST_USER = "test@example.com";

jest.mock("../../model/AuthActions");

describe("component RequireNewPassword", () => {
  beforeEach(() => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: RESET_PASSWORD,
      surveyUser: { username: TEST_USER },
    });

    (completeNewPassword as jest.Mock).mockImplementation(
      () => () => "dummy action"
    );
    (setAuthState as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("initial render and enable change actionn", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <RequireNewPassword />
    );
    const passwordInput = getByLabelText("New password");
    const changeButton = container.querySelector("#change-button");

    expect(passwordInput).toHaveDisplayValue("");
    expect(changeButton).toBeDisabled();

    // Form complete
    await user.type(passwordInput, "12345678");
    expect(changeButton).not.toBeDisabled();

    // Password empty
    await user.clear(passwordInput);
    expect(changeButton).toBeDisabled();

    // Restore
    await user.type(passwordInput, "12345678");
    expect(changeButton).not.toBeDisabled();

    // Password too short
    await user.clear(passwordInput);
    await user.type(passwordInput, "1234567");
    expect(changeButton).toBeDisabled();

    // Restore
    await user.type(passwordInput, "12345678");
    expect(changeButton).not.toBeDisabled();
  });

  it("change success", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <RequireNewPassword />
    );
    await user.type(getByLabelText("New password"), "new password");

    const changeButton = container.querySelector("#change-button")!;
    await user.click(changeButton);

    expect(completeNewPassword).toHaveBeenCalledTimes(1);
    expect(completeNewPassword).toHaveBeenCalledWith(
      { username: TEST_USER },
      "new password"
    );
    expect(changeButton).toBeDisabled();
  });

  it("back to sign in", async () => {
    const { getByRole, user } = renderWithStore(<RequireNewPassword />);

    await user.click(getByRole("button", { name: "Back to Sign In" }));

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN, { username: TEST_USER });
  });

  it("end loading spinner on auth state update", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <RequireNewPassword />
    );
    await user.type(getByLabelText("New password"), "new password");

    const changeButton = container.querySelector("#change-button")!;
    await user.click(changeButton);

    expect(changeButton).toBeDisabled();

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      user: { username: TEST_USER },
    });
    await waitFor(() => expect(changeButton).not.toBeDisabled());
  });

  it("end loading spinner on auth error", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <RequireNewPassword />
    );
    await user.type(getByLabelText("New password"), "new password");

    const changeButton = container.querySelector("#change-button")!;
    await user.click(changeButton);

    expect(changeButton).toBeDisabled();

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    await waitFor(() => expect(changeButton).not.toBeDisabled());
  });
});
