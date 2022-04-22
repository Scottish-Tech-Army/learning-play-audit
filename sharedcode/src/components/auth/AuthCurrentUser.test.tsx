import React from "react";
import { SET_AUTH_STATE } from "../../model/AuthActionTypes";
import { SIGNED_IN, SIGNED_OUT } from "../../model/AuthStates";
import { authStore } from "../../setupTests";
import { AuthCurrentUser } from "./AuthCurrentUser";
import { renderWithStore } from "./TestUtils";

describe("component AuthCurrentUser", () => {
  it("signed in", () => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_IN,
      surveyUser: { email: "test@example.com" },
    });
    const { container } = renderWithStore(<AuthCurrentUser />);

    expect(
      container.querySelector(".auth-current-user .email")!.textContent
    ).toBe("test@example.com");
  });

  it("not signed in", () => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGNED_OUT,
      surveyUser: { email: "test@example.com" },
    });
    const { container } = renderWithStore(<AuthCurrentUser />);
    expect(container.querySelector(".auth-current-user")).toBeNull();
  });
});
