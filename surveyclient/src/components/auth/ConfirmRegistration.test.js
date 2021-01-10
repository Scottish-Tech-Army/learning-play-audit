import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import ConfirmRegistration from "./ConfirmRegistration";
import surveyStore from "../../model/SurveyModel";
import { Provider } from "react-redux";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  REFRESH_STATE,
} from "../../model/ActionTypes";
import {
  SIGN_IN,
  SIGNED_OUT,
  CONFIRM_REGISTRATION,
} from "../../model/AuthStates";
import {
  resendConfirmCode,
  confirmRegistration,
  setAuthState,
} from "../../model/AuthActions";

const TEST_USER = "test@example.com";
const TEST_CODE = "65431";
const TEST_PASSWORD = "test password";

jest.mock("../../model/AuthActions");

describe("component ConfirmRegistration", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: CONFIRM_REGISTRATION,
      user: { username: TEST_USER },
    });

    resendConfirmCode.mockReset();
    confirmRegistration.mockReset();
    setAuthState.mockReset();
    resendConfirmCode.mockImplementation(() => () => "dummy action");
    confirmRegistration.mockImplementation(() => () => "dummy action");
    setAuthState.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial render and code entry - first login", () => {
    renderComponent();
    expect(emailInput().value).toStrictEqual(TEST_USER);
    expect(codeInput().value).toStrictEqual("");
    expect(confirmButton()).toBeDisabled();
    expect(continueButton()).toBeNull();

    enterCode(TEST_CODE);
    renderComponent();
    expect(confirmButton()).not.toBeDisabled();
  });

  it("confirm success", () => {
    renderComponent();
    enterCode(TEST_CODE);
    renderComponent();
    click(confirmButton());

    expect(confirmRegistration).toHaveBeenCalledTimes(1);
    expect(confirmRegistration).toHaveBeenCalledWith(
      { username: TEST_USER },
      TEST_CODE,
      null
    );
    renderComponent();
    expect(confirmButton()).toBeDisabled();
  });

  it("confirm success with signUpAttrs", () => {
    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: CONFIRM_REGISTRATION,
      user: { username: TEST_USER, signUpAttrs: { password: TEST_PASSWORD } },
    });

    renderComponent();
    enterCode(TEST_CODE);
    renderComponent();
    click(confirmButton());

    expect(confirmRegistration).toHaveBeenCalledTimes(1);
    expect(confirmRegistration).toHaveBeenCalledWith(
      { username: TEST_USER, signUpAttrs: { password: TEST_PASSWORD } },
      TEST_CODE,
      { password: TEST_PASSWORD }
    );
    renderComponent();
    expect(confirmButton()).toBeDisabled();
  });

  it("resend confirm code", () => {
    renderComponent();
    click(resendCodeButton());

    expect(resendConfirmCode).toHaveBeenCalledTimes(1);
    expect(resendConfirmCode).toHaveBeenCalledWith({ username: TEST_USER });
  });

  it("back to sign in", () => {
    renderComponent();
    click(signInButton());

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN, { username: TEST_USER });
  });

  it("end loading spinner on auth state update", () => {
    renderComponent();
    enterCode(TEST_CODE);
    renderComponent();
    click(confirmButton());
    renderComponent();
    expect(confirmButton()).toBeDisabled();

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      user: { username: TEST_USER },
    });
    renderComponent();
    expect(confirmButton()).not.toBeDisabled();
  });

  it("end loading spinner on auth error", () => {
    renderComponent();
    enterCode(TEST_CODE);
    renderComponent();
    click(confirmButton());
    renderComponent();
    expect(confirmButton()).toBeDisabled();

    surveyStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    renderComponent();
    expect(confirmButton()).not.toBeDisabled();
  });

  it("not first login can continue", () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        hasEverLoggedIn: true,
        authentication: {
          errorMessage: "",
          state: CONFIRM_REGISTRATION,
          user: undefined,
        },
      },
    });
    renderComponent();

    expect(continueButton()).not.toBeNull();
    click(continueButton());

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGNED_OUT);
  });

  const emailInput = () => container.querySelector("#confirmEmailInput");
  const codeInput = () => container.querySelector("#codeInput");
  const confirmButton = () => container.querySelector("#confirm-button");
  const resendCodeButton = () => container.querySelector("#resend-code-button");
  const signInButton = () => container.querySelector("#signin-button");
  const continueButton = () =>
    container.querySelector("#continue-signed-out-button");

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
    act(() => {
      render(
        <Provider store={surveyStore}>
          <ConfirmRegistration />
        </Provider>,
        container
      );
    });
  }
});
