import React from "react";
import TOTPSetup from "./TOTPSetup";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import { SIGN_IN, TOTP_SETUP } from "../../model/AuthStates";
import {
  setAuthState,
  getTOTPSetupQrCode,
  verifyTOTPSetup,
} from "../../model/AuthActions";
import { authStore } from "../../setupTests";
import { renderWithStore } from "./TestUtils";
import { waitFor } from "@testing-library/react";

const TEST_EMAIL = "test@example.com";
const TEST_USER = { email: TEST_EMAIL };
const TEST_CODE = "65431";

jest.mock("../../model/AuthActions");

describe("component TOTPSetup", () => {
  beforeEach(() => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: TOTP_SETUP,
      surveyUser: TEST_USER,
    });

    (verifyTOTPSetup as jest.Mock).mockImplementation(
      () => () => "dummy action"
    );
    (getTOTPSetupQrCode as jest.Mock).mockImplementation(() =>
      Promise.resolve("qrcode image src")
    );
    (setAuthState as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("initial render and code entry", async () => {
    const { container, getByLabelText, getByAltText, user } = renderWithStore(
      <TOTPSetup />
    );

    await waitFor(() =>
      expect(getByAltText("qrcode").getAttribute("src")).toBe(
        "qrcode image src"
      )
    );
    expect(getByLabelText("Enter Security Code:")).toHaveDisplayValue("");
    expect(container.querySelector("#confirm-button")).toBeDisabled();
    expect(getTOTPSetupQrCode).toHaveBeenCalledTimes(1);
    expect(getTOTPSetupQrCode).toHaveBeenCalledWith(TEST_USER);

    await user.type(getByLabelText("Enter Security Code:"), TEST_CODE);
    await waitFor(() =>
      expect(container.querySelector("#confirm-button")).not.toBeDisabled()
    );
  });

  it("setup success", async () => {
    const { container, getByLabelText, user } = renderWithStore(<TOTPSetup />);
    await user.type(getByLabelText("Enter Security Code:"), TEST_CODE);
    await user.click(container.querySelector("#confirm-button")!);

    expect(verifyTOTPSetup).toHaveBeenCalledTimes(1);
    expect(verifyTOTPSetup).toHaveBeenCalledWith(TEST_USER, TEST_CODE);
    expect(container.querySelector("#confirm-button")).toBeDisabled();
  });

  it("back to sign in", async () => {
    const { getByRole, user } = renderWithStore(<TOTPSetup />);
    await user.click(getByRole("button", { name: "Back to Sign In" }));

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN, TEST_USER);
  });

  it("end loading spinner on auth state update", async () => {
    const { container, getByLabelText, user } = renderWithStore(<TOTPSetup />);
    await user.type(getByLabelText("Enter Security Code:"), TEST_CODE);
    await user.click(container.querySelector("#confirm-button")!);

    expect(container.querySelector("#confirm-button")).toBeDisabled();

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      surveyUser: TEST_USER,
    });
    await waitFor(() =>
      expect(container.querySelector("#confirm-button")).not.toBeDisabled()
    );
  });

  it("end loading spinner on auth error", async () => {
    const { container, getByLabelText, user } = renderWithStore(<TOTPSetup />);
    await user.type(getByLabelText("Enter Security Code:"), TEST_CODE);
    await user.click(container.querySelector("#confirm-button")!);

    expect(container.querySelector("#confirm-button")).toBeDisabled();

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    await waitFor(() =>
      expect(container.querySelector("#confirm-button")).not.toBeDisabled()
    );
  });
});
