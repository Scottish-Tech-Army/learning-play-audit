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
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUBMIT,
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

export function signIn(username, password) {
  // console.log("signIn");
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
      .then((user) => {
        return dispatch(checkContact(user));
      })
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
      .then((user) => dispatch(setAuthState(SIGNED_IN, user)))
      .catch(() => {
        logger.info("User not logged in");
        return Promise.resolve("User not logged in");
      });
  };
}
