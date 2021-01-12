import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import RestartButton from "./RestartButton";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { RESTART_SURVEY, REFRESH_STATE } from "../model/ActionTypes";
import { RESULTS } from "./FixedSectionTypes";
import { INPUT_STATE, EMPTY_STATE } from "../model/TestUtils";

const returnToStart = jest.fn();

describe("component RestartButton", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });

    returnToStart.mockReset();
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("confirm dialog appears", () => {
    renderComponent();
    expect(confirmYesButton()).toBeNull();

    click(restartButton());
    expect(confirmYesButton()).not.toBeNull();
  });

  it("restart cancel", () => {
    renderComponent();
    click(restartButton());
    renderComponent();

    click(confirmNoButton());
    renderComponent();

    expect(confirmYesButton()).toBeNull();
    expect(surveyStore.getState()).toStrictEqual(INPUT_STATE);
    expect(returnToStart).not.toHaveBeenCalled();
  });

  it("restart cancel click background", () => {
    renderComponent();
    click(restartButton());
    renderComponent();

    click(backdrop());
    renderComponent();

    expect(confirmYesButton()).toBeNull();
    expect(surveyStore.getState()).toStrictEqual(INPUT_STATE);
    expect(returnToStart).not.toHaveBeenCalled();
  });

  it("restart confirm", () => {
    renderComponent();
    click(restartButton());
    renderComponent();

    click(confirmYesButton());
    renderComponent();

    expect(confirmYesButton()).toBeNull();
    expect(surveyStore.getState()).toStrictEqual({
      ...INPUT_STATE,
      answers: EMPTY_STATE.answers,
      answerCounts: EMPTY_STATE.answerCounts,
      initialisingState: false,
      photoDetails: {},
      photos: {},
    });
    expect(returnToStart).toHaveBeenCalledTimes(1);
  });

  const restartButton = () => container.querySelector("#restart-button");

  const confirmYesButton = () => document.querySelector(".dialog #yes-button");
  const confirmNoButton = () => document.querySelector(".dialog #no-button");
  const backdrop = () =>
    document.querySelector("#dialog-container div:first-child");

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <RestartButton returnToStart={returnToStart} />
        </Provider>,
        container
      );
    });
  }
});
