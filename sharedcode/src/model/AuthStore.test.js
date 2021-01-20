import { authReducer } from "./AuthStore";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "./AuthActionTypes";
import { SIGNED_IN, SIGN_IN, REGISTER } from "./AuthStates";

describe("authReducer", () => {
  beforeEach(() => {
    // localforage.config.mockClear();
  });

  it("initial state - empty", () => {
    expect(authReducer(undefined, {})).toStrictEqual(EMPTY_STATE);
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
          authentication: {
            errorMessage: "new error",
            state: SIGN_IN,
            user: "test user",
          },
          hasSeenSplashPage: true,
          hasEverLoggedIn: false,
        },
        {
          type: SET_AUTH_STATE,
          authState: "new auth state",
          user: "new user",
        }
      )
    ).toStrictEqual({
      ...INPUT_STATE,
      authentication: {
        errorMessage: "",
        state: "new auth state",
        user: "new user",
      },
      hasSeenSplashPage: true,
      hasEverLoggedIn: false,
    });
  });

  it("action SET_AUTH_STATE SIGNED_IN triggers flags", () => {
    expect(
      authReducer(
        {
          ...INPUT_STATE,
          authentication: {
            errorMessage: "new error",
            state: SIGN_IN,
            user: "test user",
          },
          hasSeenSplashPage: true,
          hasEverLoggedIn: false,
        },
        {
          type: SET_AUTH_STATE,
          authState: SIGNED_IN,
          user: "new user",
        }
      )
    ).toStrictEqual({
      ...INPUT_STATE,
      authentication: {
        errorMessage: "",
        state: SIGNED_IN,
        user: "new user",
      },
      hasSeenSplashPage: false,
      hasEverLoggedIn: false,
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

const EMPTY_STATE = {
  authentication: {
    errorMessage: "",
    state: REGISTER,
    user: undefined,
  },
};

const INPUT_STATE = {
  authentication: {
    errorMessage: "",
    state: "SignedIn",
    user: { attributes: { email: "test@example.com" } },
  },
};

// To handle test branches where photo state is undefined
const PARTIAL_EMPTY_STATE = { ...EMPTY_STATE, initialisingState: false };
delete PARTIAL_EMPTY_STATE.photoDetails;
delete PARTIAL_EMPTY_STATE.photos;

const STATE_WITH_AUTH_ERROR = {
  authentication: {
    errorMessage: "new error",
    state: SIGN_IN,
    user: "test user",
  },
};

const STATE_WITHOUT_AUTH_ERROR = {
  authentication: { errorMessage: "", state: SIGN_IN, user: "test user" },
};
