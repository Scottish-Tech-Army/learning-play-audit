import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import { ReactNode } from "react";
import { authStore } from "../../setupTests";
import userEvent from "@testing-library/user-event";

export function renderWithStore(component: ReactNode) {
  return {
    user: userEvent.setup(),
    ...render(<Provider store={authStore}>{component}</Provider>),
  };
}
