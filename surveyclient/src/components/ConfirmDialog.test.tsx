import React from "react";
import ConfirmDialog from "./ConfirmDialog";
import { renderWithStore } from "./ReactTestUtils";

var closeDialogResponse: boolean | undefined = undefined;
function closeDialog(value: boolean) {
  closeDialogResponse = value;
}
describe("component ConfirmDialog", () => {
  beforeEach(() => {
    closeDialogResponse = undefined;
  });

  it("render default buttons", () => {
    renderWithStore(
      <ConfirmDialog closeDialog={closeDialog}>Details</ConfirmDialog>
    );

    expect(confirmYesButton()).toHaveTextContent("YES");
    expect(confirmNoButton()).toHaveTextContent("NO");
  });

  it("render custom buttons", () => {
    renderWithStore(
      <ConfirmDialog
        closeDialog={closeDialog}
        yesText="test yes"
        noText="test no"
      >
        Details
      </ConfirmDialog>
    );

    expect(confirmYesButton()).toHaveTextContent("test yes");
    expect(confirmNoButton()).toHaveTextContent("test no");
  });

  it("cancel", async () => {
    const { user } = renderWithStore(
      <ConfirmDialog closeDialog={closeDialog}>Details</ConfirmDialog>
    );

    await user.click(confirmNoButton());

    expect(closeDialogResponse).toBe(false);
  });

  it("cancel click background", async () => {
    const { user } = renderWithStore(
      <ConfirmDialog closeDialog={closeDialog}>Details</ConfirmDialog>
    );

    const backdrop = document.querySelector(
      "#dialog-container div:first-child"
    )!;
    await user.click(backdrop);

    expect(closeDialogResponse).toBe(false);
  });

  it("confirm", async () => {
    const { user } = renderWithStore(
      <ConfirmDialog closeDialog={closeDialog}>Details</ConfirmDialog>
    );

    await user.click(confirmYesButton());

    expect(closeDialogResponse).toBe(true);
  });

  const confirmYesButton = () => document.querySelector(".dialog #yes-button")!;
  const confirmNoButton = () => document.querySelector(".dialog #no-button")!;
});
