import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import AuthErrorAlert from "./AuthErrorAlert";
import { getAuthStore } from "../../model/AuthStore";
import { Provider } from "react-redux";
import { SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import { clearAuthError } from "../../model/AuthActions";

const authStore = getAuthStore();

jest.mock("../../model/AuthActions");

describe("component AuthErrorAlert", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "Test error" });

    clearAuthError.mockReset();
    clearAuthError.mockImplementation(() => () => "dummy action");
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("alert on error state", () => {
    renderComponent();
    expect(alert().textContent).toStrictEqual("Test error");

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "" });
    renderComponent();
    expect(alert().textContent).toStrictEqual("");

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "Test error" });
    renderComponent();
    expect(alert().textContent).toStrictEqual("Test error");
  });

  it("close error", () => {
    renderComponent();
    expect(alert().textContent).toStrictEqual("Test error");

    click(closeButton());
    renderComponent();
    expect(clearAuthError).toHaveBeenCalledTimes(1);
  });

  it("no change on clickaway", () => {
    renderComponent();
    expect(alert().textContent).toStrictEqual("Test error");

    alert().dispatchEvent(new FocusEvent("focus"));
    click(container);
    renderComponent();
    expect(alert().textContent).toStrictEqual("Test error");
    expect(clearAuthError).not.toHaveBeenCalledTimes(1);
  });

  const alert = () => container.querySelector(".auth-alert");
  const closeButton = () => container.querySelector(".auth-alert button");

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={authStore}>
          <AuthErrorAlert />
        </Provider>,
        container
      );
    });
  }
});
