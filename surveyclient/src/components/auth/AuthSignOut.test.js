import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import AuthSignInOut from "./AuthSignInOut";
import surveyStore from "../../model/SurveyModel";
import { Provider } from "react-redux";
import { SET_AUTH_STATE } from "../../model/ActionTypes";
import {
  SIGNED_OUT,
  SIGNED_IN,
  SIGN_IN,
  REGISTER,
} from "../../model/AuthStates";
import { signOut, setAuthState } from "../../model/AuthActions";

jest.mock("../../model/AuthActions");

describe("component AuthSignInOut", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    signOut.mockReset();
    signOut.mockImplementation(() => () => "dummy action");
    setAuthState.mockReset();
    setAuthState.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("signed in", () => {
    surveyStore.dispatch({ type: SET_AUTH_STATE, authState: SIGNED_IN });
    renderComponent();

    expect(signInOutButton().textContent).toStrictEqual("LOG OUT");
    click(signInOutButton());

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(setAuthState).not.toHaveBeenCalledTimes(1);
  });

  it("signed out", () => {
    surveyStore.dispatch({ type: SET_AUTH_STATE, authState: SIGNED_OUT });
    renderComponent();

    expect(signInOutButton().textContent).toStrictEqual("LOG IN");
    click(signInOutButton());

    expect(signOut).not.toHaveBeenCalled();
    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN);
  });

  it("auth state changes", () => {
    surveyStore.dispatch({ type: SET_AUTH_STATE, authState: SIGNED_IN });
    renderComponent();
    expect(signInOutButton().textContent).toStrictEqual("LOG OUT");

    surveyStore.dispatch({ type: SET_AUTH_STATE, authState: REGISTER });
    renderComponent();
    expect(signInOutButton().textContent).toStrictEqual("LOG OUT");

    surveyStore.dispatch({ type: SET_AUTH_STATE, authState: SIGNED_OUT });
    renderComponent();
    expect(signInOutButton().textContent).toStrictEqual("LOG IN");

    surveyStore.dispatch({ type: SET_AUTH_STATE, authState: REGISTER });
    renderComponent();
    expect(signInOutButton().textContent).toStrictEqual("LOG IN");
  });

  const signInOutButton = () => container.querySelector("#auth-signin-signout");

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <AuthSignInOut />
        </Provider>,
        container
      );
    });
  }
});
