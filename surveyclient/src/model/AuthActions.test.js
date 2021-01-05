import {
  setAuthState,
  setAuthError,
  clearAuthError,
  checkContact,
  handleSignIn,
  resendConfirmCode,
  confirmRegistration,
} from "./AuthActions";
import surveyStore from "./SurveyModel";
import {
  REFRESH_STATE,
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "./ActionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  REGISTER,
  RESET_PASSWORD,
  FORGOT_PASSWORD,
  CONFIRM_REGISTRATION,
} from "./AuthStates";
import { Auth } from "@aws-amplify/auth";

const TEST_USERNAME = "test@example.com";
const TEST_PASSWORD = "test password";
const TEST_USER = {
  attributes: { email: TEST_USERNAME },
  username: TEST_USERNAME,
};
const TEST_SIGNUP_ATTRS = { password: TEST_PASSWORD };

jest.mock("@aws-amplify/auth");

describe("simple methods", () => {
  it("setAuthState", () => {
    expect(setAuthState("test state", TEST_USER)).toStrictEqual({
      type: SET_AUTH_STATE,
      authState: "test state",
      user: TEST_USER,
    });
  });

  it("setAuthError", () => {
    expect(setAuthError(new Error("test message"))).toStrictEqual({
      type: SET_AUTH_ERROR,
      message: "test message",
    });
  });

  it("clearAuthError", () => {
    expect(clearAuthError()).toStrictEqual({ type: CLEAR_AUTH_ERROR });
  });
});

describe("checkContact", () => {
  beforeEach(() => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        authentication: { errorMessage: "", state: REGISTER, user: undefined },
      },
    });

    Auth.verifiedContact.mockReset();
  });

  it("verified + unverified = verified contact", async () => {
    Auth.verifiedContact.mockImplementation(() =>
      Promise.resolve({
        verified: { email: "test" },
        unverified: { email: "test" },
      })
    );

    await surveyStore.dispatch(checkContact(TEST_USER));
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("!verified + !unverified = verified contact", async () => {
    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));

    await surveyStore.dispatch(checkContact(TEST_USER));
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("unverified contact", async () => {
    Auth.verifiedContact.mockImplementation(() =>
      Promise.resolve({ unverified: { email: "test" } })
    );

    await surveyStore.dispatch(checkContact(TEST_USER));
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "Unverified contact",
      state: REGISTER,
      user: undefined,
    });
  });

  it("error calling verifiedContact", async () => {
    Auth.verifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await surveyStore.dispatch(checkContact("test user"));
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith("test user");
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: REGISTER,
      user: undefined,
    });
  });
});

describe("handleSignIn", () => {
  beforeEach(() => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        authentication: { errorMessage: "", state: REGISTER, user: undefined },
      },
    });

    Auth.verifiedContact.mockReset();
    Auth.signIn.mockReset();

    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("signIn success", async () => {
    Auth.signIn.mockImplementation(() => Promise.resolve(TEST_USER));

    await surveyStore.dispatch(handleSignIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("new password needed", async () => {
    const testUser = { ...TEST_USER, challengeName: "NEW_PASSWORD_REQUIRED" };
    Auth.signIn.mockImplementation(() => Promise.resolve(testUser));

    await surveyStore.dispatch(handleSignIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: RESET_PASSWORD,
      user: testUser,
    });
  });

  it("confirm registration", async () => {
    Auth.signIn.mockImplementation(() =>
      Promise.reject({
        code: "UserNotConfirmedException",
        message: "error message",
      })
    );

    await surveyStore.dispatch(handleSignIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: CONFIRM_REGISTRATION,
      user: { username: "user" },
    });
  });

  it("forgot password", async () => {
    Auth.signIn.mockImplementation(() =>
      Promise.reject({
        code: "PasswordResetRequiredException",
        message: "error message",
      })
    );

    await surveyStore.dispatch(handleSignIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: FORGOT_PASSWORD,
      user: { username: "user" },
    });
  });

  it("error calling signIn", async () => {
    Auth.signIn.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await surveyStore.dispatch(handleSignIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: REGISTER,
      user: undefined,
    });
  });

  it("error calling verifiedContact", async () => {
    Auth.signIn.mockImplementation(() => Promise.resolve(TEST_USER));
    Auth.verifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await surveyStore.dispatch(handleSignIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: REGISTER,
      user: undefined,
    });
  });
});

describe("resendConfirmCode", () => {
  beforeEach(() => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        authentication: { errorMessage: "", state: REGISTER, user: TEST_USER },
      },
    });

    Auth.resendSignUp.mockReset();
  });

  it("success", async () => {
    Auth.resendSignUp.mockImplementation(() => Promise.resolve());

    await surveyStore.dispatch(resendConfirmCode(TEST_USER));
    expect(Auth.resendSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.resendSignUp).toHaveBeenCalledWith(TEST_USERNAME);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: CONFIRM_REGISTRATION,
      user: TEST_USER,
    });
  });

  it("error calling resendSignUp", async () => {
    Auth.resendSignUp.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await surveyStore.dispatch(resendConfirmCode(TEST_USER));
    expect(Auth.resendSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.resendSignUp).toHaveBeenCalledWith(TEST_USERNAME);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: REGISTER,
      user: TEST_USER,
    });
  });
});

describe("confirmRegistration", () => {
  beforeEach(() => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        authentication: {
          errorMessage: "",
          state: CONFIRM_REGISTRATION,
          user: undefined,
        },
      },
    });

    Auth.verifiedContact.mockReset();
    Auth.confirmSignUp.mockReset();
    Auth.signIn.mockReset();

    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("confirm and request signIn", async () => {
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(true));

    await surveyStore.dispatch(confirmRegistration(TEST_USER, "passcode"));
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGN_IN,
      user: TEST_USER,
    });
  });

  it("confirm and signIn success", async () => {
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(true));
    Auth.signIn.mockImplementation(() => Promise.resolve(TEST_USER));

    await surveyStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("confirm and new password needed", async () => {
    const testUser = { ...TEST_USER, challengeName: "NEW_PASSWORD_REQUIRED" };
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(true));
    Auth.signIn.mockImplementation(() => Promise.resolve(testUser));

    await surveyStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: RESET_PASSWORD,
      user: testUser,
    });
  });

  it("confirm and confirm registration - shouldn't really happen", async () => {
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(true));
    Auth.signIn.mockImplementation(() =>
      Promise.reject({
        code: "UserNotConfirmedException",
        message: "error message",
      })
    );

    await surveyStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: CONFIRM_REGISTRATION,
      user: { username: TEST_USERNAME },
    });
  });

  it("confirm and forgot password", async () => {
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(true));
    Auth.signIn.mockImplementation(() =>
      Promise.reject({
        code: "PasswordResetRequiredException",
        message: "error message",
      })
    );

    await surveyStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: FORGOT_PASSWORD,
      user: { username: TEST_USERNAME },
    });
  });

  it("confirm and error calling signIn", async () => {
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(true));
    Auth.signIn.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await surveyStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: CONFIRM_REGISTRATION,
      user: undefined,
    });
  });

  it("error calling verifiedContact", async () => {
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(true));
    Auth.signIn.mockImplementation(() => Promise.resolve(TEST_USER));
    Auth.verifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await surveyStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: CONFIRM_REGISTRATION,
      user: undefined,
    });
  });

  it("confirmSignUp failed", async () => {
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(false));

    await surveyStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "Confirm Sign Up Failed",
      state: CONFIRM_REGISTRATION,
      user: undefined,
    });
  });

  it("error calling confirmSignUp", async () => {
    Auth.confirmSignUp.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await surveyStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(surveyStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: CONFIRM_REGISTRATION,
      user: undefined,
    });
  });
});
