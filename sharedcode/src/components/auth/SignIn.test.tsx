import React from "react";
import SignIn from "./SignIn";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import {
  SIGN_IN,
  SIGNED_IN,
  REGISTER,
  FORGOT_PASSWORD_REQUEST,
} from "../../model/AuthStates";
import { setAuthState, signIn } from "../../model/AuthActions";
import { renderWithStore } from "./TestUtils";
import { waitFor } from "@testing-library/react";
import { authStore } from "../../setupTests";

const TEST_USER = "test@example.com";

jest.mock("../../model/AuthActions");

describe("component SignIn", () => {
  beforeEach(() => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      user: { username: TEST_USER },
    });

    (signIn as jest.Mock).mockImplementation(() => () => "dummy action");
    (setAuthState as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("initial render and enable signIn action", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <SignIn canRegister={true} />
    );
    const emailInput = getByLabelText("Email address");
    const passwordInput = getByLabelText("Password");
    const signInButton = container.querySelector("#signin-button");

    expect(emailInput).toHaveDisplayValue("");
    expect(passwordInput).toHaveDisplayValue("");
    expect(signInButton).toBeDisabled();

    // Form complete
    await user.type(emailInput, TEST_USER);
    await user.type(passwordInput, "12345678");
    expect(signInButton).not.toBeDisabled();

    // Email empty
    await user.clear(emailInput);
    expect(signInButton).toBeDisabled();

    // Restore
    await user.type(emailInput, TEST_USER);
    expect(signInButton).not.toBeDisabled();

    // Password empty
    await user.clear(passwordInput);
    expect(signInButton).toBeDisabled();

    // Restore
    await user.type(passwordInput, "12345678");
    expect(signInButton).not.toBeDisabled();
  });

  it("confirm success", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <SignIn canRegister={true} />
    );
    await user.type(getByLabelText("Email address"), TEST_USER);
    await user.type(getByLabelText("Password"), "12345678");

    const signInButton = container.querySelector("#signin-button")!;
    await user.click(signInButton);

    expect(signIn).toHaveBeenCalledTimes(1);
    expect(signIn).toHaveBeenCalledWith(TEST_USER, "12345678");
    expect(signInButton).toBeDisabled();
  });

  it("go to register", async () => {
    const { getByRole, user } = renderWithStore(<SignIn canRegister={true} />);
    await user.click(getByRole("button", { name: "Register" }));

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(REGISTER);
  });

  it("register not possible", async () => {
    const { queryByRole } = renderWithStore(
      <SignIn canRegister={false} />
    );

    expect(queryByRole("button", { name: "Register" })).toBeNull();
  });

  it("go to forgot password", async () => {
    const { getByRole, user } = renderWithStore(<SignIn canRegister={true} />);
    await user.click(getByRole("button", { name: "Reset password" }));
    
    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(FORGOT_PASSWORD_REQUEST);
  });

  it("end loading spinner on auth state update", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <SignIn canRegister={true} />
    );
    await user.type(getByLabelText("Email address"), TEST_USER);
    await user.type(getByLabelText("Password"), "12345678");

    const signInButton = container.querySelector("#signin-button")!;
    await user.click(signInButton);

    expect(signInButton).toBeDisabled();

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_IN,
      user: { username: TEST_USER },
    });
    await waitFor(() => expect(signInButton).not.toBeDisabled());
  });

  it("end loading spinner on auth error", async () => {
    const { container, getByLabelText, user } = renderWithStore(
      <SignIn canRegister={true} />
    );
    await user.type(getByLabelText("Email address"), TEST_USER);
    await user.type(getByLabelText("Password"), "12345678");

    const signInButton = container.querySelector("#signin-button")!;
    await user.click(signInButton);

    expect(signInButton).toBeDisabled();

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    await waitFor(() => expect(signInButton).not.toBeDisabled());
  });
});
