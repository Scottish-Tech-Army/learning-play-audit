// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import "jest-canvas-mock";
import localforage from "localforage";
import { RESET_STATE } from "./model/ActionTypes";
import { surveyStore } from "./model/SurveyModel";

// Mock local storage
jest.mock("localforage");

jest.mock("./model/SurveyPhotoUuid");

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  }));

// eslint-disable-next-line no-global-assign
console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

beforeEach(() => {
  jest.resetAllMocks();

  (localforage.getItem as jest.Mock).mockImplementation(() =>
    Promise.resolve(null)
  );
  (localforage.setItem as jest.Mock).mockImplementation(() =>
    Promise.resolve()
  );

  surveyStore.dispatch({ type: RESET_STATE });
  (localforage.getItem as jest.Mock).mockClear();
  (localforage.setItem as jest.Mock).mockClear();
});
