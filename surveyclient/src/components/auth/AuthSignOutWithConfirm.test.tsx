import React from "react";
import AuthSignOutWithConfirm from "./AuthSignOutWithConfirm";
import { signOut } from "learning-play-audit-shared";
import { renderWithStore } from "../ReactTestUtils";

jest.mock("learning-play-audit-shared");

describe("component AuthSignOutWithConfirm", () => {
  beforeEach(() => {
    (signOut as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("confirm dialog appears", async () => {
    const { getByRole, user } = renderWithStore(<AuthSignOutWithConfirm />);
    expect(confirmYesButton()).toBeNull();

    await user.click(getByRole("button", { name: "Log out" }));
    expect(confirmYesButton()).not.toBeNull();
  });

  it("signed out cancel", async () => {
    const { getByRole, user } = renderWithStore(<AuthSignOutWithConfirm />);
    await user.click(getByRole("button", { name: "Log out" }));

    await user.click(confirmNoButton()!);

    expect(confirmYesButton()).toBeNull();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("signed out cancel click background", async () => {
    const { getByRole, user } = renderWithStore(<AuthSignOutWithConfirm />);
    await user.click(getByRole("button", { name: "Log out" }));

    const backdrop = document.querySelector(
      "#dialog-container div:first-child"
    )!;
    await user.click(backdrop);

    expect(confirmYesButton()).toBeNull();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("signed out confirm", async () => {
    const { getByRole, user } = renderWithStore(<AuthSignOutWithConfirm />);
    await user.click(getByRole("button", { name: "Log out" }));

    await user.click(confirmYesButton()!);

    expect(confirmYesButton()).toBeNull();
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  const confirmYesButton = () => document.querySelector(".dialog #yes-button");
  const confirmNoButton = () => document.querySelector(".dialog #no-button");
});
