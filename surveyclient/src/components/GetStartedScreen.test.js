import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import GetStartedScreen from "./GetStartedScreen";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { REFRESH_STATE } from "../model/ActionTypes";
import { INPUT_STATE } from "../model/TestUtils";

var downloadClicked = false;
function clickDownload() {
  downloadClicked = true;
}

var propDownloadButton = null;

describe("component GetStartedScreen", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
    downloadClicked = false;
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  const DOWNLOAD_BUTTON = (
    <button className="download-button" onClick={clickDownload}>
      INSTALL SURVEY APP
    </button>
  );

  it("first login with download", () => {
    propDownloadButton = DOWNLOAD_BUTTON;
    const inputState = {
      ...INPUT_STATE,
      hasEverLoggedIn: false,
      hasSeenSplashPage: false,
    };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderComponent();

    expect(confirmButton().textContent).toStrictEqual("START SURVEY HERE");
    expect(section()).toHaveTextContent(
      "download it as an app using the Install button"
    );

    clickConfirmButton();
    expect(surveyStore.getState().hasSeenSplashPage).toStrictEqual(true);

    expect(downloadClicked).toStrictEqual(false);
    clickDownloadButton();
    expect(downloadClicked).toStrictEqual(true);
  });

  it("first login without download", () => {
    propDownloadButton = null;
    const inputState = {
      ...INPUT_STATE,
      hasEverLoggedIn: false,
      hasSeenSplashPage: false,
    };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderComponent();

    expect(confirmButton().textContent).toStrictEqual("START SURVEY HERE");
    expect(section()).not.toHaveTextContent(
      "download it as an app using the Install button"
    );

    clickConfirmButton();
    expect(surveyStore.getState().hasSeenSplashPage).toStrictEqual(true);

    expect(downloadButton()).toBeNull();
  });

  it("non first login with download", () => {
    propDownloadButton = DOWNLOAD_BUTTON;
    const inputState = {
      ...INPUT_STATE,
      hasEverLoggedIn: true,
      hasSeenSplashPage: false,
    };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderComponent();

    expect(confirmButton().textContent).toStrictEqual("CONTINUE SURVEY");
    expect(section()).toHaveTextContent(
      "download it as an app using the Install button"
    );

    clickConfirmButton();
    expect(surveyStore.getState().hasSeenSplashPage).toStrictEqual(true);

    expect(downloadClicked).toStrictEqual(false);
    clickDownloadButton();
    expect(downloadClicked).toStrictEqual(true);
  });

  it("non first login without download", () => {
    propDownloadButton = null;
    const inputState = {
      ...INPUT_STATE,
      hasEverLoggedIn: true,
      hasSeenSplashPage: false,
    };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderComponent();

    expect(confirmButton().textContent).toStrictEqual("CONTINUE SURVEY");
    expect(section()).not.toHaveTextContent(
      "download it as an app using the Install button"
    );

    clickConfirmButton();
    expect(surveyStore.getState().hasSeenSplashPage).toStrictEqual(true);

    expect(downloadButton()).toBeNull();
  });

  const section = () => container.querySelector(".section");
  const confirmButton = () => container.querySelector(".confirm-button");
  const downloadButton = () => container.querySelector(".download-button");

  function clickConfirmButton() {
    confirmButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
  function clickDownloadButton() {
    downloadButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <GetStartedScreen downloadButton={propDownloadButton} />
        </Provider>,
        container
      );
    });
  }
});
