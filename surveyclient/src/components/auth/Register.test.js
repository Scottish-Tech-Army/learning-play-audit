import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import Register from "./Register";
import surveyStore from "../../model/SurveyModel";
import { Provider } from "react-redux";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  REFRESH_STATE,
} from "../../model/ActionTypes";
import { SIGN_IN, SIGNED_OUT, REGISTER } from "../../model/AuthStates";
import { setAuthState, register } from "../../model/AuthActions";

const TEST_USER = "test@example.com";

jest.mock("../../model/AuthActions");

describe("component Register", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: REGISTER,
      user: { username: TEST_USER },
    });

    register.mockReset();
    setAuthState.mockReset();
    register.mockImplementation(() => () => "dummy action");
    setAuthState.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial render and enable register action - first login", () => {
    renderComponent();
    expect(emailInput().value).toStrictEqual("");
    expect(passwordInput().value).toStrictEqual("");
    expect(tncCheck()).not.toBeChecked();
    expect(gdprCheck()).not.toBeChecked();
    expect(registerButton()).toBeDisabled();
    expect(continueButton()).toBeNull();

    // Form complete
    enterEmail(TEST_USER);
    enterPassword("12345678");
    click(tncCheck());
    click(gdprCheck());
    renderComponent();
    expect(registerButton()).not.toBeDisabled();

    // Email empty
    enterEmail("");
    renderComponent();
    expect(registerButton()).toBeDisabled();

    // Restore
    enterEmail(TEST_USER);
    renderComponent();
    expect(registerButton()).not.toBeDisabled();

    // Password empty
    enterPassword("");
    renderComponent();
    expect(registerButton()).toBeDisabled();

    // Restore
    enterPassword("12345678");
    renderComponent();
    expect(registerButton()).not.toBeDisabled();

    // Password too short
    enterPassword("1234567");
    renderComponent();
    expect(registerButton()).toBeDisabled();

    // Restore
    enterPassword("12345678");
    renderComponent();
    expect(registerButton()).not.toBeDisabled();

    // TnC unchecked
    click(tncCheck());
    renderComponent();
    expect(registerButton()).toBeDisabled();

    // Restore
    click(tncCheck());
    renderComponent();
    expect(registerButton()).not.toBeDisabled();

    // GDPR unchecked
    click(gdprCheck());
    renderComponent();
    expect(registerButton()).toBeDisabled();

    // Restore
    click(gdprCheck());
    renderComponent();
    expect(registerButton()).not.toBeDisabled();
  });

  it("confirm success", () => {
    renderComponent();
    enterEmail(TEST_USER);
    enterPassword("12345678");
    click(tncCheck());
    click(gdprCheck());
    renderComponent();
    click(registerButton());

    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith(TEST_USER, "12345678");
    renderComponent();
    expect(registerButton()).toBeDisabled();
  });

  it("back to sign in", () => {
    renderComponent();
    click(signInButton());

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN);
  });

  it("end loading spinner on auth state update", () => {
    renderComponent();
    enterEmail(TEST_USER);
    enterPassword("12345678");
    click(tncCheck());
    click(gdprCheck());
    renderComponent();
    click(registerButton());
    renderComponent();
    expect(registerButton()).toBeDisabled();

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      user: { username: TEST_USER },
    });
    renderComponent();
    expect(registerButton()).not.toBeDisabled();
  });

  it("end loading spinner on auth error", () => {
    renderComponent();
    enterEmail(TEST_USER);
    enterPassword("12345678");
    click(tncCheck());
    click(gdprCheck());
    renderComponent();
    click(registerButton());
    renderComponent();
    expect(registerButton()).toBeDisabled();

    surveyStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    renderComponent();
    expect(registerButton()).not.toBeDisabled();
  });

  it("not first login can continue", () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        hasEverLoggedIn: true,
        authentication: {
          errorMessage: "",
          state: REGISTER,
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

  it("gdpr popup", () => {
    renderComponent();
    expect(gdprPopup()).toBeNull();

    click(gdprPopupButton());
    renderComponent();
    expect(gdprPopup()).not.toBeNull();

    // Click close
    click(gdprPopupCloseButton());
    renderComponent();
    expect(gdprPopup()).toBeNull();

    //  Open again
    click(gdprPopupButton());
    renderComponent();
    expect(gdprPopup()).not.toBeNull();

    // Click backdrop
    click(backdrop());
    renderComponent();
    expect(gdprPopup()).toBeNull();
  });

  const tncCheck = () => container.querySelector("#tnc-check");
  const gdprCheck = () => container.querySelector("#gdpr-check");
  const emailInput = () => container.querySelector("#emailInput");
  const passwordInput = () => container.querySelector("#passwordInput");
  const registerButton = () => container.querySelector("#register-button");
  const signInButton = () => container.querySelector("#signin-button");
  const continueButton = () =>
    container.querySelector("#continue-signed-out-button");
  const gdprPopupCloseButton = () =>
    document.querySelector(".tooltip-popup .close-button");
  const backdrop = () =>
    document.querySelector("#popup-container div:first-child");
  const gdprPopup = () => document.querySelector(".tooltip-popup");
  const gdprPopupButton = () => document.querySelector("#gdpr-popup-button");

  function enterEmail(value) {
    act(() => {
      const element = emailInput();
      element.value = value;
      Simulate.input(element);
    });
  }

  function enterPassword(value) {
    act(() => {
      const element = passwordInput();
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
          <Register />
        </Provider>,
        container
      );
    });
  }
});
