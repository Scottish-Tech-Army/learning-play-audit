import React from "react";
import GetStartedScreen from "./GetStartedScreen";
import { surveyStore } from "../model/SurveyModel";
import { REFRESH_STATE } from "../model/ActionTypes";
import { INPUT_STATE } from "../model/TestUtils";
import { renderWithStore } from "./ReactTestUtils";

const clickDownload = jest.fn();

describe("component GetStartedScreen", () => {
  beforeEach(() => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
  });

  const DOWNLOAD_BUTTON = (
    <button className="download-button" onClick={clickDownload}>
      INSTALL SURVEY APP
    </button>
  );

  it("first login with download", async () => {
    const inputState = {
      ...INPUT_STATE,
      hasEverLoggedIn: false,
      hasSeenSplashPage: false,
    };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    const { container, getByRole, user } = renderWithStore(
      <GetStartedScreen downloadButton={DOWNLOAD_BUTTON} />
    );

    expect(container).toHaveTextContent(
      "download it as an app using the Install button"
    );

    await user.click(getByRole("button", { name: "START SURVEY HERE" }));
    expect(surveyStore.getState().hasSeenSplashPage).toBe(true);

    expect(clickDownload).not.toHaveBeenCalled();
    await user.click(getByRole("button", { name: "INSTALL SURVEY APP" }));
    expect(clickDownload).toHaveBeenCalledTimes(1);
  });

  it("first login without download", async () => {
    const inputState = {
      ...INPUT_STATE,
      hasEverLoggedIn: false,
      hasSeenSplashPage: false,
    };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    const { container, getByRole, queryByRole, user } = renderWithStore(
      <GetStartedScreen downloadButton={null} />
    );

    expect(container).not.toHaveTextContent(
      "download it as an app using the Install button"
    );

    await user.click(getByRole("button", { name: "START SURVEY HERE" }));
    expect(surveyStore.getState().hasSeenSplashPage).toBe(true);

    expect(queryByRole("button", { name: "INSTALL SURVEY APP" })).toBeNull();
  });

  it("non first login with download", async () => {
    const inputState = {
      ...INPUT_STATE,
      hasEverLoggedIn: true,
      hasSeenSplashPage: false,
    };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    const { container, getByRole, user } = renderWithStore(
      <GetStartedScreen downloadButton={DOWNLOAD_BUTTON} />
    );

    expect(container).toHaveTextContent(
      "download it as an app using the Install button"
    );

    await user.click(getByRole("button", { name: "CONTINUE SURVEY" }));
    expect(surveyStore.getState().hasSeenSplashPage).toBe(true);

    expect(clickDownload).not.toHaveBeenCalled();
    await user.click(getByRole("button", { name: "INSTALL SURVEY APP" }));
    expect(clickDownload).toHaveBeenCalledTimes(1);
  });

  it("non first login without download", async () => {
    const inputState = {
      ...INPUT_STATE,
      hasEverLoggedIn: true,
      hasSeenSplashPage: false,
    };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    const { container, getByRole, queryByRole, user } = renderWithStore(
      <GetStartedScreen downloadButton={null} />
    );

    expect(container).not.toHaveTextContent(
      "download it as an app using the Install button"
    );

    await user.click(getByRole("button", { name: "CONTINUE SURVEY" }));
    expect(surveyStore.getState().hasSeenSplashPage).toBe(true);

    expect(queryByRole("button", { name: "INSTALL SURVEY APP" })).toBeNull();
  });
});
