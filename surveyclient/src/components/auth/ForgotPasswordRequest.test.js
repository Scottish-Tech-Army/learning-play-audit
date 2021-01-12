import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import ForgotPasswordRequest from "./ForgotPasswordRequest";
import surveyStore from "../../model/SurveyModel";
import { Provider } from "react-redux";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/ActionTypes";
import { SIGN_IN, FORGOT_PASSWORD_REQUEST } from "../../model/AuthStates";
import { setAuthState, forgotPasswordRequest } from "../../model/AuthActions";

const TEST_USER = "test@example.com";

jest.mock("../../model/AuthActions");

describe("component ForgotPasswordRequest", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: FORGOT_PASSWORD_REQUEST,
      user: undefined,
    });

    forgotPasswordRequest.mockReset();
    setAuthState.mockReset();
    forgotPasswordRequest.mockImplementation(() => () => "dummy action");
    setAuthState.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial render and enable password request action", () => {
    renderComponent();
    expect(emailInput().value).toStrictEqual("");
    expect(requestButton()).toBeDisabled();

    // Form complete
    enterEmail(TEST_USER);
    renderComponent();
    expect(requestButton()).not.toBeDisabled();

    // Email empty
    enterEmail("");
    renderComponent();
    expect(requestButton()).toBeDisabled();

    // Restore
    enterEmail(TEST_USER);
    renderComponent();
    expect(requestButton()).not.toBeDisabled();
  });

  it("request success", () => {
    renderComponent();
    enterEmail(TEST_USER);
    renderComponent();
    click(requestButton());

    expect(forgotPasswordRequest).toHaveBeenCalledTimes(1);
    expect(forgotPasswordRequest).toHaveBeenCalledWith(TEST_USER);
    renderComponent();
    expect(requestButton()).toBeDisabled();
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
    renderComponent();
    click(requestButton());
    renderComponent();
    expect(requestButton()).toBeDisabled();

    surveyStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      user: undefined,
    });
    renderComponent();
    expect(requestButton()).not.toBeDisabled();
  });

  it("end loading spinner on auth error", () => {
    renderComponent();
    enterEmail(TEST_USER);
    renderComponent();
    click(requestButton());
    renderComponent();
    expect(requestButton()).toBeDisabled();

    surveyStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    renderComponent();
    expect(requestButton()).not.toBeDisabled();
  });

  const emailInput = () => container.querySelector("#emailInput");
  const requestButton = () => container.querySelector("#request-button");
  const signInButton = () => container.querySelector("#signin-button");

  function enterEmail(value) {
    act(() => {
      const element = emailInput();
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
          <ForgotPasswordRequest />
        </Provider>,
        container
      );
    });
  }
});
