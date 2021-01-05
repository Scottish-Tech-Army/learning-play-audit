import { Auth } from "@aws-amplify/auth";
import { Logger, isEmpty } from "@aws-amplify/core";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "./ActionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  CONFIRM_REGISTRATION,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
} from "./AuthStates";

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
          dispatch(setAuthState(SIGNED_IN, user));
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

export function handleSignIn(username, password) {
  // console.log("handleSignIn");
  return function (dispatch) {
    return Auth.signIn(username, password)
      .then((user) => {
        logger.debug(user);
        if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
          logger.debug("require new password", user.challengeParam);
          dispatch(setAuthState(RESET_PASSWORD, user));
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
          dispatch(setAuthState(FORGOT_PASSWORD, { username }));
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

export function confirmRegistration(user, code, _signUpAttrs) {
  // console.log("confirmRegistration");
  return function (dispatch) {
    return Auth.confirmSignUp(user.username, code)
      .then((result) => {
        if (!result) {
          throw new Error("Confirm Sign Up Failed");
        }
        if (
          _signUpAttrs &&
          _signUpAttrs.password &&
          _signUpAttrs.password !== ""
        ) {
          // Auto sign in user if password is available from previous workflow
          return dispatch(handleSignIn(user.username, _signUpAttrs.password));
        } else {
          dispatch(setAuthState(SIGN_IN, user));
        }
      })
      .catch((error) => dispatch(setAuthError(error)));
  };
}
