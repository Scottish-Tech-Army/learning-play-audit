import { Auth } from "@aws-amplify/auth";
import { Logger, isEmpty } from "@aws-amplify/core";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "../../model/ActionTypes";
import {
  SIGNED_IN,
  CONFIRM_REGISTRATION,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
} from "../../model/AuthStates";

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
  console.log("checkContact");
  return function (dispatch) {
    return Auth.verifiedContact(user)
      .then((data) => {
        if (!isEmpty(data.verified) || isEmpty(data.unverified)) {
          dispatch(setAuthState(SIGNED_IN, user));
        } else {
          throw new Error("Unverified contact: ", user, data);
        }
      })
      .catch((error) => {
        dispatch(setAuthError(error));
      });
  };
}

export function handleSignIn(username, password) {
  console.log("handleSignIn");
  return function (dispatch) {
    return Auth.signIn(username, password)
      .then((user) => {
        logger.debug(user);
        if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
          logger.debug("require new password", user.challengeParam);
          dispatch(setAuthState(RESET_PASSWORD, user));
        } else {
          dispatch(checkContact(user));
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
