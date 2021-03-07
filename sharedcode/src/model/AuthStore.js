import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "./AuthActionTypes.js";
import { REGISTER, SIGNED_IN } from "./AuthStates.js";

function initialState() {
  console.debug("Setting initialState");
  return {
    authentication: {
      errorMessage: "",
      state: REGISTER,
      user: undefined,
    },
  };
}

export function authReducer(state = initialState(), action) {
  switch (action.type) {
    case SET_AUTH_STATE:
      console.debug("SET_AUTH_STATE");
      return setAuthState(state, action);

    case SET_AUTH_ERROR:
      console.debug("SET_AUTH_ERROR");
      return setAuthError(state, action);

    case CLEAR_AUTH_ERROR:
      console.debug("CLEAR_AUTH_ERROR");
      return clearAuthError(state);

    default:
      console.debug("Unknown action: " + JSON.stringify(action));
      return state;
  }
}

function setAuthState(state, { authState, user }) {
  if (authState === undefined) {
    console.error("authState cannot be undefined");
    return state;
  }
  return {
    ...state,
    authentication: { state: authState, user: user, errorMessage: "" },
    // Show welcome screen on every login
    hasSeenSplashPage: state.hasSeenSplashPage && authState !== SIGNED_IN,
  };
}

function setAuthError(state, { message }) {
  if (state.authentication.errorMessage === message) {
    return state;
  }
  const result = { ...state };
  result.authentication = { ...result.authentication };
  result.authentication.errorMessage = message;
  return result;
}

function clearAuthError(state) {
  if (state.authentication.errorMessage === "") {
    return state;
  }
  const result = { ...state };
  result.authentication.errorMessage = "";
  return result;
}

export function getAuthStore() {
  return createStore(authReducer, applyMiddleware(thunk));
}
