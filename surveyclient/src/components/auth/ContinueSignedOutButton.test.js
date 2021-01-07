import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import ContinueSignedOutButton from "./ContinueSignedOutButton";
import surveyStore from "../../model/SurveyModel";
import { Provider } from "react-redux";
import { REFRESH_STATE } from "../../model/ActionTypes";
import { SIGNED_OUT, REGISTER } from "../../model/AuthStates";

describe("component ContinueSignedOutButton", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("first login", () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: { hasEverLoggedIn: false },
    });
    renderComponent();

    expect(continueButton()).toBeNull();
  });

  it("not first login", () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        hasEverLoggedIn: true,
        authentication: { errorMessage: "", state: REGISTER, user: undefined },
      },
    });
    renderComponent();

    expect(continueButton()).not.toBeNull();
    click(continueButton());

    expect(surveyStore.getState().authentication.state).toStrictEqual(
      SIGNED_OUT
    );
  });

  const continueButton = () =>
    container.querySelector("#continue-signed-out-button");

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <ContinueSignedOutButton />
        </Provider>,
        container
      );
    });
  }
});
