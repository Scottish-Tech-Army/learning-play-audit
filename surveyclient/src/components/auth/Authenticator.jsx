import React, { useEffect } from "react";
import Register from "./Register";
import ConfirmRegistration from "./ConfirmRegistration";
import SignIn from "./SignIn";
import ForgotPasswordRequest from "./ForgotPasswordRequest";
import ForgotPasswordSubmit from "./ForgotPasswordSubmit";
import RequireNewPassword from "./RequireNewPassword";
import AuthErrorAlert from "./AuthErrorAlert";
import { useDispatch, useSelector } from "react-redux";
import {
  REGISTER,
  SIGN_IN,
  SIGNED_OUT,
  SIGNED_IN,
  CONFIRM_REGISTRATION,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUBMIT,
  RESET_PASSWORD,
} from "../../model/AuthStates";
import { signInCurrentUser } from "../../model/AuthActions";

export function isAuthenticating(state) {
  return state !== SIGNED_IN && state !== SIGNED_OUT;
}

export default function Authenticator() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authentication.state);

  useEffect(() => {
    dispatch(signInCurrentUser());
  }, [dispatch]);

  function renderAuthComponent() {
    switch (authState) {
      case SIGN_IN:
        return <SignIn />;
      case REGISTER:
        return <Register />;
      case CONFIRM_REGISTRATION:
        return <ConfirmRegistration />;
      case FORGOT_PASSWORD_REQUEST:
        return <ForgotPasswordRequest />;
      case FORGOT_PASSWORD_SUBMIT:
        return <ForgotPasswordSubmit />;
      case RESET_PASSWORD:
        return <RequireNewPassword />;
      default:
        console.error(`Unhandled auth state: ${authState}`);
    }
  }

  return (
    <>
      <AuthErrorAlert />
      {isAuthenticating(authState) && (
        <div className="section authenticator">
          <img
            className="title-logo-small"
            src="./assets/ltl-logo.jpg"
            alt=""
          />
          {renderAuthComponent()}
        </div>
      )}
    </>
  );
}
