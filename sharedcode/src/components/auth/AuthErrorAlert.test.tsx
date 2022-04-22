import React from "react";
import AuthErrorAlert from "./AuthErrorAlert";
import { SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import { clearAuthError } from "../../model/AuthActions";
import { renderWithStore } from "./TestUtils";
import { authStore } from "../../setupTests";
import { waitFor } from "@testing-library/dom";

jest.mock("../../model/AuthActions");

describe("component AuthErrorAlert", () => {
  beforeEach(() => {
    authStore.dispatch({ type: SET_AUTH_ERROR, message: "Test error" });

    (clearAuthError as jest.Mock).mockImplementation(
      () => () => "dummy action"
    );
  });

  it("alert on error state", async () => {
    const { container } = renderWithStore(<AuthErrorAlert />);
    expect(container).toHaveTextContent("Test error");

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "" });
    await waitFor(() => expect(container).toHaveTextContent(""));

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "Test error" });
    await waitFor(() => expect(container).toHaveTextContent("Test error"));
  });

  it("close error", async () => {
    const { container, getByRole, user } = renderWithStore(<AuthErrorAlert />);
    expect(container).toHaveTextContent("Test error");

    await user.click(getByRole("button"));
    expect(clearAuthError).toHaveBeenCalledTimes(1);
  });

  it("no change on clickaway", async () => {
    const { container, user } = renderWithStore(<AuthErrorAlert />);
    expect(container).toHaveTextContent("Test error");

    await user.click(container);
    expect(container).toHaveTextContent("Test error");
    expect(clearAuthError).not.toHaveBeenCalledTimes(1);
  });
});
