import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import TOTPSetup from "./TOTPSetup";
import { getAuthStore } from "../../model/AuthStore";
import { Provider } from "react-redux";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import { SIGN_IN, TOTP_SETUP } from "../../model/AuthStates";
import {
  setAuthState,
  getTOTPSetupQrCode,
  verifyTOTPSetup,
} from "../../model/AuthActions";

const TEST_USERNAME = "test@example.com";
const TEST_USER = { username: TEST_USERNAME };
const TEST_CODE = "65431";

const authStore = getAuthStore();

jest.mock("../../model/AuthActions");

describe("component TOTPSetup", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: TOTP_SETUP,
      user: TEST_USER,
    });

    verifyTOTPSetup.mockReset();
    getTOTPSetupQrCode.mockReset();
    setAuthState.mockReset();
    verifyTOTPSetup.mockImplementation(() => () => "dummy action");
    getTOTPSetupQrCode.mockImplementation(() =>
      Promise.resolve("qrcode image src")
    );
    setAuthState.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial render and code entry", async () => {
    await renderComponent();
    expect(qrImage().getAttribute("src")).toStrictEqual("qrcode image src");
    expect(codeInput().value).toStrictEqual("");
    expect(confirmButton()).toBeDisabled();
    expect(getTOTPSetupQrCode).toHaveBeenCalledTimes(1);
    expect(getTOTPSetupQrCode).toHaveBeenCalledWith(TEST_USER);

    enterCode(TEST_CODE);
    renderComponent();
    expect(confirmButton()).not.toBeDisabled();
  });

  it("setup success", async () => {
    await renderComponent();
    enterCode(TEST_CODE);
    renderComponent();
    click(confirmButton());

    expect(verifyTOTPSetup).toHaveBeenCalledTimes(1);
    expect(verifyTOTPSetup).toHaveBeenCalledWith(TEST_USER, TEST_CODE);
    renderComponent();
    expect(confirmButton()).toBeDisabled();
  });

  it("back to sign in", () => {
    renderComponent();
    click(signInButton());

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN, TEST_USER);
  });

  it("end loading spinner on auth state update", async () => {
    await renderComponent();
    enterCode(TEST_CODE);
    renderComponent();
    click(confirmButton());
    renderComponent();
    expect(confirmButton()).toBeDisabled();

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      user: TEST_USER,
    });
    renderComponent();
    expect(confirmButton()).not.toBeDisabled();
  });

  it("end loading spinner on auth error", async () => {
    await renderComponent();
    enterCode(TEST_CODE);
    renderComponent();
    click(confirmButton());
    renderComponent();
    expect(confirmButton()).toBeDisabled();

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    renderComponent();
    expect(confirmButton()).not.toBeDisabled();
  });

  const codeInput = () => container.querySelector("#codeInput");
  const confirmButton = () => container.querySelector("#confirm-button");
  const qrImage = () => container.querySelector("#qr-code");
  const signInButton = () => container.querySelector("#signin-button");

  function enterCode(value) {
    act(() => {
      const element = codeInput();
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
    return act(() => {
      render(
        <Provider store={authStore}>
          <TOTPSetup />
        </Provider>,
        container
      );
    });
  }
});
