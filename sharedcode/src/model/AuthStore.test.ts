import { authReducer, AuthStoreState } from "./AuthStore";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "./AuthActionTypes";
import { SIGNED_IN, SIGN_IN, REGISTER } from "./AuthStates";
import { AnyAction } from "redux";

describe("authReducer", () => {
  it("initial state - empty", () => {
    expect(authReducer(undefined, {} as AnyAction)).toStrictEqual(EMPTY_STATE);
  });

  it("action SET_AUTH_ERROR", () => {
    expect(
      authReducer(STATE_WITHOUT_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "new error",
      })
    ).toStrictEqual(STATE_WITH_AUTH_ERROR);

    expect(
      authReducer(STATE_WITH_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "",
      })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);

    expect(
      authReducer(STATE_WITH_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "new error",
      })
    ).toStrictEqual(STATE_WITH_AUTH_ERROR);
  });

  it("action CLEAR_AUTH_ERROR", () => {
    expect(
      authReducer(STATE_WITH_AUTH_ERROR, { type: CLEAR_AUTH_ERROR })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);

    expect(
      authReducer(STATE_WITHOUT_AUTH_ERROR, { type: CLEAR_AUTH_ERROR })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);
  });

  it("action SET_AUTH_STATE", () => {
    expect(
      authReducer(
        {
          ...INPUT_STATE,
          errorMessage: "new error",
          authState: SIGN_IN,
          surveyUser: { username: "test user" },
        },
        {
          type: SET_AUTH_STATE,
          authState: "new auth state",
          surveyUser: { username: "new user" },
        }
      )
    ).toStrictEqual({
      ...INPUT_STATE,
      errorMessage: "",
      authState: "new auth state",
      surveyUser: { username: "new user" },
    });
  });

  it("action SET_AUTH_STATE authState undefined", () => {
    expect(
      authReducer(INPUT_STATE, {
        type: SET_AUTH_STATE,
        user: "new user",
      })
    ).toStrictEqual(INPUT_STATE);
  });
});

const EMPTY_STATE: AuthStoreState = {
  errorMessage: "",
  authState: REGISTER,
};

const INPUT_STATE: AuthStoreState = {
  errorMessage: "",
  authState: SIGNED_IN,
  surveyUser: { username: "test user", email: "test@example.com" },
};

const STATE_WITH_AUTH_ERROR: AuthStoreState = {
  errorMessage: "new error",
  authState: SIGN_IN,
  surveyUser: { username: "test user" },
};

const STATE_WITHOUT_AUTH_ERROR: AuthStoreState = {
  errorMessage: "",
  authState: SIGN_IN,
  surveyUser: { username: "test user" },
};
