// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import "jest-canvas-mock";
import localforage from "localforage";

// Mock local storage
jest.mock("localforage");

beforeEach(() => {
  localforage.getItem.mockReset();
  localforage.setItem.mockReset();

  localforage.getItem.mockImplementation(() => Promise.resolve(null));
  localforage.setItem.mockImplementation(() => Promise.resolve());
});
