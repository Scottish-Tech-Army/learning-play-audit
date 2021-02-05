import {
  setAuthState,
  setAuthError,
  clearAuthError,
  checkContact,
  signIn,
  confirmSignIn,
  resendConfirmCode,
  confirmRegistration,
  register,
  completeNewPassword,
  signOut,
  forgotPasswordRequest,
  forgotPasswordSubmit,
  signInCurrentUser,
  getTOTPSetupQrCode,
  verifyTOTPSetup,
  getUserMFA,
} from "./AuthActions";
import { getAuthStore } from "./AuthStore";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "./AuthActionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  CONFIRM_SIGN_IN,
  REGISTER,
  RESET_PASSWORD,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUBMIT,
  CONFIRM_REGISTRATION,
  NEW_PASSWORD_REQUIRED,
  TOTP_SETUP,
  MFA_OPTION_NONE,
  MFA_OPTION_TOTP,
  MFA_OPTION_SMS,
  SMS_MFA,
  NO_MFA,
  SOFTWARE_TOKEN_MFA,
} from "./AuthStates";
import { Auth } from "@aws-amplify/auth";
import QRCode from "qrcode";

const TEST_USERNAME = "test@example.com";
const TEST_PASSWORD = "test password";
const TEST_USER = {
  attributes: { email: TEST_USERNAME },
  username: TEST_USERNAME,
};
const TEST_SIGNUP_ATTRS = { username: TEST_USERNAME, password: TEST_PASSWORD };

const authStore = getAuthStore();

jest.mock("@aws-amplify/auth");
jest.mock("qrcode");

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
    authStore.dispatch(setAuthState(REGISTER, undefined));

    Auth.verifiedContact.mockReset();
  });

  it("verified + unverified = verified contact", async () => {
    Auth.verifiedContact.mockImplementation(() =>
      Promise.resolve({
        verified: { email: "test" },
        unverified: { email: "test" },
      })
    );

    await authStore.dispatch(checkContact(TEST_USER));
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("!verified + !unverified = verified contact", async () => {
    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));

    await authStore.dispatch(checkContact(TEST_USER));
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("unverified contact", async () => {
    Auth.verifiedContact.mockImplementation(() =>
      Promise.resolve({ unverified: { email: "test" } })
    );

    await authStore.dispatch(checkContact(TEST_USER));
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "Unverified contact",
      state: REGISTER,
      user: undefined,
    });
  });

  it("error calling verifiedContact", async () => {
    Auth.verifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(checkContact("test user"));
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith("test user");
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: REGISTER,
      user: undefined,
    });
  });
});

describe("signIn", () => {
  beforeEach(() => {
    authStore.dispatch(setAuthState(REGISTER, undefined));

    Auth.verifiedContact.mockReset();
    Auth.signIn.mockReset();

    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("signIn success", async () => {
    Auth.signIn.mockImplementation(() => Promise.resolve(TEST_USER));

    await authStore.dispatch(signIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("new password needed", async () => {
    const testUser = { ...TEST_USER, challengeName: "NEW_PASSWORD_REQUIRED" };
    Auth.signIn.mockImplementation(() => Promise.resolve(testUser));

    await authStore.dispatch(signIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: RESET_PASSWORD,
      user: testUser,
    });
  });

  it("confirm signin SMS", async () => {
    const testUser = { ...TEST_USER, challengeName: SMS_MFA };
    Auth.signIn.mockImplementation(() => Promise.resolve(testUser));

    await authStore.dispatch(signIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: CONFIRM_SIGN_IN,
      user: testUser,
    });
  });

  it("confirm signin TOTP", async () => {
    const testUser = { ...TEST_USER, challengeName: SOFTWARE_TOKEN_MFA };
    Auth.signIn.mockImplementation(() => Promise.resolve(testUser));

    await authStore.dispatch(signIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: CONFIRM_SIGN_IN,
      user: testUser,
    });
  });

  it("mfa TOTP setup", async () => {
    const testUser = { ...TEST_USER, challengeName: "MFA_SETUP" };
    Auth.signIn.mockImplementation(() => Promise.resolve(testUser));

    await authStore.dispatch(signIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: TOTP_SETUP,
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

    await authStore.dispatch(signIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(authStore.getState().authentication).toStrictEqual({
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

    await authStore.dispatch(signIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: FORGOT_PASSWORD_REQUEST,
      user: { username: "user" },
    });
  });

  it("error calling signIn", async () => {
    Auth.signIn.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(signIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(authStore.getState().authentication).toStrictEqual({
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

    await authStore.dispatch(signIn("user", "password"));
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith("user", "password");
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: REGISTER,
      user: undefined,
    });
  });
});

describe("confirmSignIn", () => {
  beforeEach(() => {
    authStore.dispatch(setAuthState(CONFIRM_SIGN_IN, TEST_USER));

    Auth.verifiedContact.mockReset();
    Auth.confirmSignIn.mockReset();

    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("confirm SMS success", async () => {
    Auth.confirmSignIn.mockImplementation(() => Promise.resolve(true));

    await authStore.dispatch(
      confirmSignIn(TEST_USER, "passcode", MFA_OPTION_SMS)
    );
    expect(Auth.confirmSignIn).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignIn).toHaveBeenCalledWith(
      TEST_USER,
      "passcode",
      null
    );
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("confirm TOTP success", async () => {
    Auth.confirmSignIn.mockImplementation(() => Promise.resolve(true));

    await authStore.dispatch(
      confirmSignIn(TEST_USER, "passcode", MFA_OPTION_TOTP)
    );
    expect(Auth.confirmSignIn).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignIn).toHaveBeenCalledWith(
      TEST_USER,
      "passcode",
      SOFTWARE_TOKEN_MFA
    );
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("error calling verifiedContact", async () => {
    Auth.confirmSignIn.mockImplementation(() => Promise.resolve(true));
    Auth.verifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(
      confirmSignIn(TEST_USER, "passcode", MFA_OPTION_SMS)
    );
    expect(Auth.confirmSignIn).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignIn).toHaveBeenCalledWith(
      TEST_USER,
      "passcode",
      null
    );
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: CONFIRM_SIGN_IN,
      user: TEST_USER,
    });
  });

  it("error calling confirmSignIn", async () => {
    Auth.confirmSignIn.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(
      confirmSignIn(TEST_USER, "passcode", MFA_OPTION_SMS)
    );
    expect(Auth.confirmSignIn).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignIn).toHaveBeenCalledWith(
      TEST_USER,
      "passcode",
      null
    );
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: CONFIRM_SIGN_IN,
      user: TEST_USER,
    });
  });
});

describe("resendConfirmCode", () => {
  beforeEach(() => {
    authStore.dispatch(setAuthState(REGISTER, TEST_USER));

    Auth.resendSignUp.mockReset();
  });

  it("success", async () => {
    Auth.resendSignUp.mockImplementation(() => Promise.resolve());

    await authStore.dispatch(resendConfirmCode(TEST_USER));
    expect(Auth.resendSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.resendSignUp).toHaveBeenCalledWith(TEST_USERNAME);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: CONFIRM_REGISTRATION,
      user: TEST_USER,
    });
  });

  it("error calling resendSignUp", async () => {
    Auth.resendSignUp.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(resendConfirmCode(TEST_USER));
    expect(Auth.resendSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.resendSignUp).toHaveBeenCalledWith(TEST_USERNAME);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: REGISTER,
      user: TEST_USER,
    });
  });
});

describe("confirmRegistration", () => {
  beforeEach(() => {
    authStore.dispatch(setAuthState(CONFIRM_REGISTRATION, undefined));

    Auth.verifiedContact.mockReset();
    Auth.confirmSignUp.mockReset();
    Auth.signIn.mockReset();

    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("confirm and request signIn", async () => {
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(true));

    await authStore.dispatch(confirmRegistration(TEST_USER, "passcode"));
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGN_IN,
      user: TEST_USER,
    });
  });

  it("confirm and signIn success", async () => {
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(true));
    Auth.signIn.mockImplementation(() => Promise.resolve(TEST_USER));

    await authStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("confirm and new password needed", async () => {
    const testUser = { ...TEST_USER, challengeName: "NEW_PASSWORD_REQUIRED" };
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(true));
    Auth.signIn.mockImplementation(() => Promise.resolve(testUser));

    await authStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(authStore.getState().authentication).toStrictEqual({
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

    await authStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(authStore.getState().authentication).toStrictEqual({
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

    await authStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: FORGOT_PASSWORD_REQUEST,
      user: { username: TEST_USERNAME },
    });
  });

  it("confirm and error calling signIn", async () => {
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(true));
    Auth.signIn.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(authStore.getState().authentication).toStrictEqual({
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

    await authStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: CONFIRM_REGISTRATION,
      user: undefined,
    });
  });

  it("confirmSignUp failed", async () => {
    Auth.confirmSignUp.mockImplementation(() => Promise.resolve(false));

    await authStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "Confirm Sign Up Failed",
      state: CONFIRM_REGISTRATION,
      user: undefined,
    });
  });

  it("error calling confirmSignUp", async () => {
    Auth.confirmSignUp.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(
      confirmRegistration(TEST_USER, "passcode", TEST_SIGNUP_ATTRS)
    );
    expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
    expect(Auth.confirmSignUp).toHaveBeenCalledWith(TEST_USERNAME, "passcode");
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: CONFIRM_REGISTRATION,
      user: undefined,
    });
  });
});

describe("register", () => {
  beforeEach(() => {
    authStore.dispatch(setAuthState(REGISTER, undefined));

    Auth.verifiedContact.mockReset();
    Auth.confirmSignUp.mockReset();
    Auth.signIn.mockReset();
    Auth.signUp.mockReset();

    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("register and request confirm", async () => {
    Auth.signUp.mockImplementation(() => Promise.resolve({ user: TEST_USER }));

    await authStore.dispatch(register(TEST_USERNAME, TEST_PASSWORD));
    expect(Auth.signUp).toHaveBeenCalledTimes(1);
    expect(Auth.signUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: CONFIRM_REGISTRATION,
      user: { ...TEST_USER, signUpAttrs: TEST_SIGNUP_ATTRS },
    });
  });

  it("register and signIn success", async () => {
    Auth.signUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_USER, userConfirmed: true })
    );
    Auth.signIn.mockImplementation(() => Promise.resolve(TEST_USER));

    await authStore.dispatch(register(TEST_USERNAME, TEST_PASSWORD));
    expect(Auth.signUp).toHaveBeenCalledTimes(1);
    expect(Auth.signUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("register and new password needed", async () => {
    const testUser = { ...TEST_USER, challengeName: "NEW_PASSWORD_REQUIRED" };
    Auth.signUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_USER, userConfirmed: true })
    );
    Auth.signIn.mockImplementation(() => Promise.resolve(testUser));

    await authStore.dispatch(register(TEST_USERNAME, TEST_PASSWORD));
    expect(Auth.signUp).toHaveBeenCalledTimes(1);
    expect(Auth.signUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: RESET_PASSWORD,
      user: testUser,
    });
  });

  it("register as confirmed and confirm registration - shouldn't really happen", async () => {
    Auth.signUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_USER, userConfirmed: true })
    );
    Auth.signIn.mockImplementation(() =>
      Promise.reject({
        code: "UserNotConfirmedException",
        message: "error message",
      })
    );

    await authStore.dispatch(register(TEST_USERNAME, TEST_PASSWORD));
    expect(Auth.signUp).toHaveBeenCalledTimes(1);
    expect(Auth.signUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: CONFIRM_REGISTRATION,
      user: { username: TEST_USERNAME },
    });
  });

  it("register and forgot password", async () => {
    Auth.signUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_USER, userConfirmed: true })
    );
    Auth.signIn.mockImplementation(() =>
      Promise.reject({
        code: "PasswordResetRequiredException",
        message: "error message",
      })
    );

    await authStore.dispatch(register(TEST_USERNAME, TEST_PASSWORD));
    expect(Auth.signUp).toHaveBeenCalledTimes(1);
    expect(Auth.signUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: FORGOT_PASSWORD_REQUEST,
      user: { username: TEST_USERNAME },
    });
  });

  it("register and error calling signIn", async () => {
    Auth.signUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_USER, userConfirmed: true })
    );
    Auth.signIn.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(register(TEST_USERNAME, TEST_PASSWORD));
    expect(Auth.signUp).toHaveBeenCalledTimes(1);
    expect(Auth.signUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: REGISTER,
      user: undefined,
    });
  });

  it("error calling verifiedContact", async () => {
    Auth.signUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_USER, userConfirmed: true })
    );
    Auth.signIn.mockImplementation(() => Promise.resolve(TEST_USER));
    Auth.verifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(register(TEST_USERNAME, TEST_PASSWORD));
    expect(Auth.signUp).toHaveBeenCalledTimes(1);
    expect(Auth.signUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(Auth.signIn).toHaveBeenCalledTimes(1);
    expect(Auth.signIn).toHaveBeenCalledWith(TEST_USERNAME, TEST_PASSWORD);
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: REGISTER,
      user: undefined,
    });
  });

  it("signUp failed - return empty result", async () => {
    Auth.signUp.mockImplementation(() => Promise.resolve());

    await authStore.dispatch(register(TEST_USERNAME, TEST_PASSWORD));
    expect(Auth.signUp).toHaveBeenCalledTimes(1);
    expect(Auth.signUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "Sign Up Failed",
      state: REGISTER,
      user: undefined,
    });
  });

  it("error calling signUp", async () => {
    Auth.signUp.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(register(TEST_USERNAME, TEST_PASSWORD));
    expect(Auth.signUp).toHaveBeenCalledTimes(1);
    expect(Auth.signUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: REGISTER,
      user: undefined,
    });
  });
});

describe("completeNewPassword", () => {
  beforeEach(() => {
    authStore.dispatch(setAuthState(NEW_PASSWORD_REQUIRED, TEST_USER));

    Auth.verifiedContact.mockReset();
    Auth.completeNewPassword.mockReset();
    Auth.currentAuthenticatedUser.mockReset();

    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("success", async () => {
    Auth.completeNewPassword.mockImplementation(() =>
      Promise.resolve(TEST_USER)
    );

    await authStore.dispatch(completeNewPassword(TEST_USER, "new password"));
    expect(Auth.completeNewPassword).toHaveBeenCalledTimes(1);
    expect(Auth.completeNewPassword).toHaveBeenCalledWith(
      TEST_USER,
      "new password",
      {}
    );
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("success with null user", async () => {
    Auth.currentAuthenticatedUser.mockImplementation(() =>
      Promise.resolve(TEST_USER)
    );
    Auth.completeNewPassword.mockImplementation(() =>
      Promise.resolve(TEST_USER)
    );

    await authStore.dispatch(completeNewPassword(null, "new password"));
    expect(Auth.currentAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(Auth.completeNewPassword).toHaveBeenCalledTimes(1);
    expect(Auth.completeNewPassword).toHaveBeenCalledWith(
      TEST_USER,
      "new password",
      {}
    );
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });

  it("error calling verifiedContact", async () => {
    Auth.completeNewPassword.mockImplementation(() =>
      Promise.resolve(TEST_USER)
    );
    Auth.verifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(completeNewPassword(TEST_USER, "new password"));
    expect(Auth.completeNewPassword).toHaveBeenCalledTimes(1);
    expect(Auth.completeNewPassword).toHaveBeenCalledWith(
      TEST_USER,
      "new password",
      {}
    );
    expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
    expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);

    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: NEW_PASSWORD_REQUIRED,
      user: TEST_USER,
    });
  });

  it("error calling completeNewPassword", async () => {
    Auth.completeNewPassword.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(completeNewPassword(TEST_USER, "new password"));
    expect(Auth.completeNewPassword).toHaveBeenCalledTimes(1);
    expect(Auth.completeNewPassword).toHaveBeenCalledWith(
      TEST_USER,
      "new password",
      {}
    );
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: NEW_PASSWORD_REQUIRED,
      user: TEST_USER,
    });
  });

  it("error calling currentAuthenticatedUser", async () => {
    Auth.currentAuthenticatedUser.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(completeNewPassword(null, "new password"));
    expect(Auth.currentAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: NEW_PASSWORD_REQUIRED,
      user: TEST_USER,
    });
  });
});

describe("signOut", () => {
  beforeEach(() => {
    authStore.dispatch(setAuthState(SIGNED_IN, TEST_USER));

    Auth.signOut.mockReset();
    Auth.signOut.mockImplementation(() => Promise.resolve({}));
  });

  it("success", async () => {
    await authStore.dispatch(signOut());
    expect(Auth.signOut).toHaveBeenCalledTimes(1);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGN_IN,
      user: undefined,
    });
  });

  it("error calling signOut", async () => {
    Auth.signOut.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(signOut());
    expect(Auth.signOut).toHaveBeenCalledTimes(1);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: SIGNED_IN,
      user: TEST_USER,
    });
  });
});

describe("forgotPasswordRequest", () => {
  beforeEach(() => {
    authStore.dispatch(setAuthState(FORGOT_PASSWORD_REQUEST, undefined));

    Auth.forgotPassword.mockReset();
    Auth.forgotPassword.mockImplementation(() => Promise.resolve({}));
  });

  it("success", async () => {
    await authStore.dispatch(forgotPasswordRequest(TEST_USERNAME));
    expect(Auth.forgotPassword).toHaveBeenCalledTimes(1);
    expect(Auth.forgotPassword).toHaveBeenCalledWith(TEST_USERNAME);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: FORGOT_PASSWORD_SUBMIT,
      user: { username: TEST_USERNAME },
    });
  });

  it("error calling forgotPassword", async () => {
    Auth.forgotPassword.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(forgotPasswordRequest(TEST_USERNAME));
    expect(Auth.forgotPassword).toHaveBeenCalledTimes(1);
    expect(Auth.forgotPassword).toHaveBeenCalledWith(TEST_USERNAME);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: FORGOT_PASSWORD_REQUEST,
      user: undefined,
    });
  });
});

describe("forgotPasswordSubmit", () => {
  beforeEach(() => {
    authStore.dispatch(
      setAuthState(FORGOT_PASSWORD_SUBMIT, { username: TEST_USERNAME })
    );

    Auth.forgotPasswordSubmit.mockReset();
    Auth.forgotPasswordSubmit.mockImplementation(() => Promise.resolve({}));
  });

  it("success", async () => {
    await authStore.dispatch(
      forgotPasswordSubmit(TEST_USERNAME, "12345", TEST_PASSWORD)
    );
    expect(Auth.forgotPasswordSubmit).toHaveBeenCalledTimes(1);
    expect(Auth.forgotPasswordSubmit).toHaveBeenCalledWith(
      TEST_USERNAME,
      "12345",
      TEST_PASSWORD
    );
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGN_IN,
      user: undefined,
    });
  });

  it("error calling forgotPasswordSubmit", async () => {
    Auth.forgotPasswordSubmit.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authStore.dispatch(
      forgotPasswordSubmit(TEST_USERNAME, "12345", TEST_PASSWORD)
    );
    expect(Auth.forgotPasswordSubmit).toHaveBeenCalledTimes(1);
    expect(Auth.forgotPasswordSubmit).toHaveBeenCalledWith(
      TEST_USERNAME,
      "12345",
      TEST_PASSWORD
    );
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "test error",
      state: FORGOT_PASSWORD_SUBMIT,
      user: { username: TEST_USERNAME },
    });
  });
});

describe("signInCurrentUser", () => {
  beforeEach(() => {
    authStore.dispatch(setAuthState(FORGOT_PASSWORD_SUBMIT, undefined));

    Auth.currentAuthenticatedUser.mockReset();
    Auth.currentAuthenticatedUser.mockImplementation(() =>
      Promise.resolve({ username: TEST_USERNAME })
    );

    Auth.userAttributes.mockReset();
    Auth.userAttributes.mockImplementation(() =>
      Promise.resolve([
        {
          Name: "email",
          Value: TEST_USERNAME,
        },
      ])
    );
  });

  it("success with existing email", async () => {
    Auth.currentAuthenticatedUser.mockImplementation(() =>
      Promise.resolve({
        username: TEST_USERNAME,
        attributes: { email: TEST_USERNAME },
      })
    );

    await authStore.dispatch(signInCurrentUser());
    expect(Auth.currentAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(Auth.userAttributes).not.toHaveBeenCalled();
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: { username: TEST_USERNAME, attributes: { email: TEST_USERNAME } },
    });
  });

  it("success without existing email", async () => {
    await authStore.dispatch(signInCurrentUser());
    expect(Auth.currentAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(Auth.userAttributes).toHaveBeenCalledTimes(1);
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: SIGNED_IN,
      user: { username: TEST_USERNAME, attributes: { email: TEST_USERNAME } },
    });
  });

  it("no user authenticated", async () => {
    Auth.currentAuthenticatedUser.mockImplementation(() =>
      Promise.reject(new Error("no user authenticated"))
    );

    await authStore.dispatch(signInCurrentUser());
    expect(Auth.currentAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(Auth.userAttributes).not.toHaveBeenCalled();
    expect(authStore.getState().authentication).toStrictEqual({
      errorMessage: "",
      state: FORGOT_PASSWORD_SUBMIT,
      user: undefined,
    });
  });
});

describe("getTOTPSetupQrCode", () => {
  beforeEach(() => {
    authStore.dispatch(setAuthState(REGISTER, undefined));

    Auth.setupTOTP.mockReset();
    Auth.setupTOTP.mockImplementation((user) =>
      Promise.resolve("secret key for " + user.username)
    );
    Auth.setPreferredMFA.mockReset();
    Auth.setPreferredMFA.mockImplementation(() => Promise.resolve("success"));

    QRCode.toDataURL.mockReset();
    QRCode.toDataURL.mockImplementation((key) =>
      Promise.resolve("image data with " + key)
    );
  });

  it("success", () => {
    const expectedData =
      "image data with otpauth://totp/AWSCognito:" +
      TEST_USERNAME +
      "?secret=secret key for " +
      TEST_USERNAME +
      "&issuer=AWSCognito";
    return getTOTPSetupQrCode(TEST_USER).then((result) => {
      expect(result).toStrictEqual(expectedData);
      expect(Auth.setPreferredMFA).toHaveBeenCalledTimes(1);
      expect(Auth.setPreferredMFA).toHaveBeenCalledWith(
        TEST_USER,
        MFA_OPTION_NONE
      );
    });
  });
});

describe("getUserMFA", () => {
  beforeEach(() => {
    Auth.getPreferredMFA.mockReset();
  });

  it("mfa TOTP", () => {
    Auth.getPreferredMFA.mockImplementation(() =>
      Promise.resolve(SOFTWARE_TOKEN_MFA)
    );

    return getUserMFA(TEST_USER).then((result) => {
      expect(result).toStrictEqual(MFA_OPTION_TOTP);
      expect(Auth.getPreferredMFA).toHaveBeenCalledTimes(1);
      expect(Auth.getPreferredMFA).toHaveBeenCalledWith(TEST_USER);
    });
  });

  it("mfa SMS", () => {
    Auth.getPreferredMFA.mockImplementation(() => Promise.resolve(SMS_MFA));

    return getUserMFA(TEST_USER).then((result) => {
      expect(result).toStrictEqual(MFA_OPTION_SMS);
      expect(Auth.getPreferredMFA).toHaveBeenCalledTimes(1);
      expect(Auth.getPreferredMFA).toHaveBeenCalledWith(TEST_USER);
    });
  });

  it("mfa NOMFA", () => {
    Auth.getPreferredMFA.mockImplementation(() => Promise.resolve(NO_MFA));

    return getUserMFA(TEST_USER).then((result) => {
      expect(result).toStrictEqual(MFA_OPTION_NONE);
      expect(Auth.getPreferredMFA).toHaveBeenCalledTimes(1);
      expect(Auth.getPreferredMFA).toHaveBeenCalledWith(TEST_USER);
    });
  });
});

describe("verifyTOTPSetup", () => {
  beforeEach(() => {
    authStore.dispatch(setAuthState(TOTP_SETUP, TEST_USER));

    Auth.verifiedContact.mockReset();
    Auth.verifyTotpToken.mockReset();
    Auth.setPreferredMFA.mockReset();

    Auth.verifiedContact.mockImplementation(() => Promise.resolve({}));
    Auth.verifyTotpToken.mockImplementation(() => Promise.resolve({}));
    Auth.setPreferredMFA.mockImplementation(() => Promise.resolve({}));
  });

  it("success", async () => {
    return authStore
      .dispatch(verifyTOTPSetup(TEST_USER, "passcode"))
      .then(() => {
        expect(Auth.verifyTotpToken).toHaveBeenCalledTimes(1);
        expect(Auth.verifyTotpToken).toHaveBeenCalledWith(
          TEST_USER,
          "passcode"
        );
        expect(Auth.setPreferredMFA).toHaveBeenCalledTimes(1);
        expect(Auth.setPreferredMFA).toHaveBeenCalledWith(
          TEST_USER,
          MFA_OPTION_TOTP
        );
        expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
        expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
        expect(authStore.getState().authentication).toStrictEqual({
          errorMessage: "",
          state: SIGNED_IN,
          user: TEST_USER,
        });
      });
  });

  it("error calling verifiedContact", async () => {
    Auth.verifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    return authStore
      .dispatch(verifyTOTPSetup(TEST_USER, "passcode"))
      .then(() => {
        expect(Auth.verifyTotpToken).toHaveBeenCalledTimes(1);
        expect(Auth.verifyTotpToken).toHaveBeenCalledWith(
          TEST_USER,
          "passcode"
        );
        expect(Auth.setPreferredMFA).toHaveBeenCalledTimes(1);
        expect(Auth.setPreferredMFA).toHaveBeenCalledWith(
          TEST_USER,
          MFA_OPTION_TOTP
        );
        expect(Auth.verifiedContact).toHaveBeenCalledTimes(1);
        expect(Auth.verifiedContact).toHaveBeenCalledWith(TEST_USER);
        expect(authStore.getState().authentication).toStrictEqual({
          errorMessage: "test error",
          state: TOTP_SETUP,
          user: TEST_USER,
        });
      });
  });

  it("error calling setPreferredMFA", async () => {
    Auth.setPreferredMFA.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    return authStore
      .dispatch(verifyTOTPSetup(TEST_USER, "passcode"))
      .then(() => {
        expect(Auth.verifyTotpToken).toHaveBeenCalledTimes(1);
        expect(Auth.verifyTotpToken).toHaveBeenCalledWith(
          TEST_USER,
          "passcode"
        );
        expect(Auth.setPreferredMFA).toHaveBeenCalledTimes(1);
        expect(Auth.setPreferredMFA).toHaveBeenCalledWith(
          TEST_USER,
          MFA_OPTION_TOTP
        );
        expect(Auth.verifiedContact).not.toHaveBeenCalled();
        expect(authStore.getState().authentication).toStrictEqual({
          errorMessage: "test error",
          state: TOTP_SETUP,
          user: TEST_USER,
        });
      });
  });

  it("error calling verifyTotpToken", async () => {
    Auth.verifyTotpToken.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    return authStore
      .dispatch(verifyTOTPSetup(TEST_USER, "passcode"))
      .then(() => {
        expect(Auth.verifyTotpToken).toHaveBeenCalledTimes(1);
        expect(Auth.verifyTotpToken).toHaveBeenCalledWith(
          TEST_USER,
          "passcode"
        );
        expect(Auth.setPreferredMFA).not.toHaveBeenCalled();
        expect(Auth.verifiedContact).not.toHaveBeenCalled();
        expect(authStore.getState().authentication).toStrictEqual({
          errorMessage: "test error",
          state: TOTP_SETUP,
          user: TEST_USER,
        });
      });
  });
});
