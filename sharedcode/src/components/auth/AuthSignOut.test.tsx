import React from "react";
import { AuthSignOut } from "./AuthSignOut";
import { signOut } from "../../model/AuthActions";
import { renderWithStore } from "./TestUtils";

jest.mock("../../model/AuthActions");

describe("component AuthSignOut", () => {
  beforeEach(() => {
    (signOut as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("signed out", async () => {
    const { getByRole, user } = renderWithStore(<AuthSignOut />);
    await user.click(getByRole("button", { name: "Log out" }));

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
