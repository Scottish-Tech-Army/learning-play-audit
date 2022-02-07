// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import "jest-canvas-mock";
import localforage from "localforage";

// Mock local storage
jest.mock("localforage");

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));
    
    global.console = {
      log: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    
      // Keep native behaviour for other methods
      error: console.error,
      warn: console.warn,
    };

beforeEach(() => {
  localforage.getItem.mockReset();
  localforage.setItem.mockReset();

  localforage.getItem.mockImplementation(() => Promise.resolve(null));
  localforage.setItem.mockImplementation(() => Promise.resolve());
});
