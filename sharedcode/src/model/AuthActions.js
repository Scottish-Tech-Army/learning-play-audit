import { Auth } from "@aws-amplify/auth";
import { Logger, isEmpty } from "@aws-amplify/core";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "./AuthActionTypes.js";
import {
  SIGNED_IN,
  SIGN_IN,
  CONFIRM_SIGN_IN,
  CONFIRM_REGISTRATION,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUBMIT,
  RESET_PASSWORD,
  TOTP_SETUP,
  MFA_OPTION_NONE,
  MFA_OPTION_TOTP,
  MFA_OPTION_SMS,
  SOFTWARE_TOKEN_MFA,
  SMS_MFA,
} from "./AuthStates.js";
import QRCode from "qrcode";

const logger = new Logger("auth-utils");

export function setAuthState(authState, user) {
  return { type: SET_AUTH_STATE, authState: authState, user: user };
}

export function setAuthError(error) {
  return { type: SET_AUTH_ERROR, message: error.message };
}

export function clearAuthError() {
  return { type: CLEAR_AUTH_ERROR };
}

export function checkContact(user) {
  // console.log("checkContact");
  return function (dispatch) {
    return Auth.verifiedContact(user)
      .then((data) => {
        if (!isEmpty(data.verified) || isEmpty(data.unverified)) {
          dispatch(checkHasEmail(user));
        } else {
          console.error("Unverified contact: ", user, data);
          throw new Error("Unverified contact");
        }
      })
      .catch((error) => {
        dispatch(setAuthError(error));
      });
  };
}

function checkHasEmail(user) {
  // console.log("checkHasEmail");
  return function (dispatch) {
    if (user.attributes && user.attributes.email) {
      dispatch(setAuthState(SIGNED_IN, user));
    } else {
      return Auth.userAttributes(user)
        .then((attributeArray) => {
          if (!user.attributes) {
            user.attributes = {};
          }
          attributeArray.forEach((attribute) => {
            user.attributes[attribute.Name] = attribute.Value;
          });
          if (!user.attributes.email) {
            console.error("User does not have email attribute");
          }
          dispatch(setAuthState(SIGNED_IN, user));
        })
        .catch((error) => {
          dispatch(setAuthError(error));
        });
    }
  };
}

export function signIn(username, password) {
  // console.log("signIn");
  return function (dispatch) {
    return Auth.signIn(username, password)
      .then((user) => {
        logger.debug(user);
        if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
          logger.debug("require new password", user.challengeParam);
          dispatch(setAuthState(RESET_PASSWORD, user));
        } else if (
          user.challengeName === SMS_MFA ||
          user.challengeName === SOFTWARE_TOKEN_MFA
        ) {
          logger.debug("confirm user with " + user.challengeName);
          dispatch(setAuthState(CONFIRM_SIGN_IN, user));
        } else if (user.challengeName === "MFA_SETUP") {
          logger.debug("TOTP setup", user.challengeParam);
          dispatch(setAuthState(TOTP_SETUP, user));
        } else {
          return dispatch(checkContact(user));
        }
      })
      .catch((error) => {
        dispatch(setAuthError(error));
        if (error.code === "UserNotConfirmedException") {
          logger.debug("the user is not confirmed");
          dispatch(setAuthState(CONFIRM_REGISTRATION, { username }));
        } else if (error.code === "PasswordResetRequiredException") {
          logger.debug("the user requires a new password");
          dispatch(setAuthState(FORGOT_PASSWORD_REQUEST, { username }));
        }
      });
  };
}

export function resendConfirmCode(user) {
  // console.log("resendConfirmCode");
  return function (dispatch) {
    return Auth.resendSignUp(user.username)
      .then(() => {
        dispatch(setAuthState(CONFIRM_REGISTRATION, user));
      })
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function confirmRegistration(user, code, signUpAttrs) {
  // console.log("confirmRegistration");
  return function (dispatch) {
    return Auth.confirmSignUp(user.username, code)
      .then((result) => {
        if (!result) {
          throw new Error("Confirm Sign Up Failed");
        }
        if (
          signUpAttrs &&
          signUpAttrs.password &&
          signUpAttrs.password !== ""
        ) {
          // Auto sign in user if password is available from previous workflow
          return dispatch(signIn(user.username, signUpAttrs.password));
        } else {
          dispatch(setAuthState(SIGN_IN, user));
        }
      })
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function confirmSignIn(user, code, mfaOption) {
  // console.log("confirmSignIn");
  return function (dispatch) {
    return Auth.confirmSignIn(
      user,
      code,
      mfaOption === MFA_OPTION_TOTP ? SOFTWARE_TOKEN_MFA : null
    )
      .then(() => dispatch(checkContact(user)))
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function register(username, password) {
  // console.log("register");
  return function (dispatch) {
    const signUpAttributes = { username: username, password: password };
    return Auth.signUp(signUpAttributes)
      .then((result) => {
        if (!result) {
          throw new Error("Sign Up Failed");
        }
        if (result.userConfirmed) {
          // Auto sign in user if pre-confirmed
          return dispatch(signIn(username, password));
        } else {
          dispatch(
            setAuthState(CONFIRM_REGISTRATION, {
              ...result.user,
              signUpAttrs: { ...signUpAttributes },
            })
          );
        }
      })
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function completeNewPassword(user, newPassword) {
  // console.log("completeNewPassword");
  return function (dispatch) {
    let getUserPromise = null;
    if (!user) {
      getUserPromise = () => Auth.currentAuthenticatedUser();
    } else {
      getUserPromise = () => Promise.resolve(user);
    }
    return getUserPromise()
      .then((user) => Auth.completeNewPassword(user, newPassword, {}))
      .then((user) => dispatch(checkContact(user)))
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function signOut() {
  // console.log("signOut");
  return function (dispatch) {
    return Auth.signOut()
      .then(() => dispatch(setAuthState(SIGN_IN)))
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function forgotPasswordRequest(username) {
  // console.log("forgotPasswordRequest");
  return function (dispatch) {
    return Auth.forgotPassword(username)
      .then(() =>
        dispatch(setAuthState(FORGOT_PASSWORD_SUBMIT, { username: username }))
      )
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function forgotPasswordSubmit(username, code, newPassword) {
  // console.log("forgotPasswordSubmit");
  return function (dispatch) {
    return Auth.forgotPasswordSubmit(username, code, newPassword)
      .then(() => dispatch(setAuthState(SIGN_IN)))
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function signInCurrentUser(username, code, newPassword) {
  // console.log("signInCurrentUser");
  return function (dispatch) {
    return Auth.currentAuthenticatedUser()
      .then((user) => dispatch(checkHasEmail(user)))
      .catch(() => {
        logger.info("User not logged in");
        return Promise.resolve("User not logged in");
      });
  };
}

export function getTOTPSetupQrCode(user) {
  // console.log("getTOTPSetupQrCode");
  // workaround for https://github.com/aws-amplify/amplify-js/issues/1226
  return Auth.setPreferredMFA(user, MFA_OPTION_NONE)
    .then(() => Auth.setupTOTP(user))
    .then((secretKey) =>
      Promise.resolve(
        QRCode.toDataURL(
          `otpauth://totp/AWSCognito:${user.username}?secret=${secretKey}&issuer=AWSCognito`
        )
      )
    );
}

export function verifyTOTPSetup(user, code) {
  // console.log("verifyTOTPSetup");
  return function (dispatch) {
    return Auth.verifyTotpToken(user, code)
      .then(() => Auth.setPreferredMFA(user, MFA_OPTION_TOTP))
      .then(() => dispatch(checkContact(user)))
      .catch((error) => {
        console.error(error);
        dispatch(setAuthError(error));
      });
  };
}

export function getUserMFA(user) {
  // console.log("getUserMFA");
  return Auth.getPreferredMFA(user).then((data) => {
    console.log("Preferred MFA", data);
    if (data === SOFTWARE_TOKEN_MFA) {
      return MFA_OPTION_TOTP;
    }
    if (data === SMS_MFA) {
      return MFA_OPTION_SMS;
    }
    return MFA_OPTION_NONE;
  });
}
