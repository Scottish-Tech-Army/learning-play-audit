import React, { useEffect } from "react";
import { Auth } from "@aws-amplify/auth";
import { Logger } from "@aws-amplify/core";
import Register from "./Register";
import ConfirmRegistration from "./ConfirmRegistration";
import SignIn from "./SignIn";
import ForgotPassword from "./ForgotPassword";
import RequireNewPassword from "./RequireNewPassword";
import AuthErrorAlert from "./AuthErrorAlert";
import { useDispatch, useSelector } from "react-redux";
import {
  REGISTER,
  SIGN_IN,
  SIGNED_OUT,
  SIGNED_IN,
  CONFIRM_REGISTRATION,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
} from "../../model/AuthStates";
import { setAuthState } from "./utils";

const logger = new Logger("Authenticator");

export function isAuthenticating(state) {
  return state !== SIGNED_IN && state !== SIGNED_OUT;
}

export default function Authenticator() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authentication.state);

  useEffect(() => {
    async function checkUser() {
      return Auth.currentAuthenticatedUser()
        .then((user) => {
          dispatch(setAuthState(SIGNED_IN, user));
        })
        .catch(() => {
          logger.info("User not logged in");
        });
    }

    async function waitCheckUser() {
      await checkUser();
    }

    waitCheckUser();
  }, [dispatch]);

  function renderAuthComponent() {
    switch (authState) {
      case SIGN_IN:
        return <SignIn />;
      case REGISTER:
        return <Register />;
      case CONFIRM_REGISTRATION:
        return <ConfirmRegistration />;
      case FORGOT_PASSWORD:
        return <ForgotPassword />;
      case RESET_PASSWORD:
        return <RequireNewPassword />;
      default:
        throw new Error(`Unhandled auth state: ${authState}`);
    }
  }

  return (
    <>
      <AuthErrorAlert />
      {isAuthenticating(authState) && (
        <div className="authenticator-wrapper">
          <div className="authenticator">
            <img
              className="title-logo-small"
              src="./assets/ltl-logo.jpg"
              alt=""
            />
            {renderAuthComponent()}
          </div>
        </div>
      )}
    </>
  );
}
