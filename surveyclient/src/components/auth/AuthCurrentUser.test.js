import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import AuthCurrentUser from "./AuthCurrentUser";
import surveyStore from "../../model/SurveyModel";
import { Provider } from "react-redux";
import { REFRESH_STATE } from "../../model/ActionTypes";
import { SIGNED_IN, SIGNED_OUT } from "../../model/AuthStates";

describe("component AuthCurrentUser", () => {
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

  it("signed in", () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        authentication: {
          errorMessage: "",
          state: SIGNED_IN,
          user: { attributes: { email: "test@example.com" } },
        },
      },
    });
    renderComponent();

    expect(
      container.querySelector(".auth-current-user .email").textContent
    ).toStrictEqual("test@example.com");
  });

  it("not signed in", () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        authentication: {
          errorMessage: "",
          state: SIGNED_OUT,
          user: { attributes: { email: "test@example.com" } },
        },
      },
    });
    renderComponent();

    expect(container.querySelector(".auth-current-user")).toBeNull();
  });

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <AuthCurrentUser />
        </Provider>,
        container
      );
    });
  }
});
