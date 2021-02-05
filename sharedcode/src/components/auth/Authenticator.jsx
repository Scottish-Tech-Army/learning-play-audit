import React, { useEffect } from "react";
import Register from "./Register";
import ConfirmRegistration from "./ConfirmRegistration";
import SignIn from "./SignIn";
import ConfirmSignIn from "./ConfirmSignIn";
import ForgotPasswordRequest from "./ForgotPasswordRequest";
import ForgotPasswordSubmit from "./ForgotPasswordSubmit";
import RequireNewPassword from "./RequireNewPassword";
import TOTPSetup from "./TOTPSetup";
import AuthErrorAlert from "./AuthErrorAlert";
import { useDispatch, useSelector } from "react-redux";
import {
  REGISTER,
  SIGN_IN,
  CONFIRM_SIGN_IN,
  SIGNED_OUT,
  SIGNED_IN,
  CONFIRM_REGISTRATION,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUBMIT,
  RESET_PASSWORD,
  TOTP_SETUP,
} from "../../model/AuthStates";
import { signInCurrentUser } from "../../model/AuthActions";

export function isAuthenticating(state) {
  return state !== SIGNED_IN && state !== SIGNED_OUT;
}

export function Authenticator({ canRegister = true }) {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authentication.state);

  useEffect(() => {
    dispatch(signInCurrentUser());
  }, [dispatch]);

  function renderAuthComponent() {
    switch (authState) {
      case SIGN_IN:
        return <SignIn canRegister={canRegister} />;
      case CONFIRM_SIGN_IN:
        return <ConfirmSignIn />;
      case REGISTER:
        return canRegister ? <Register /> : null;
      case CONFIRM_REGISTRATION:
        return <ConfirmRegistration />;
      case FORGOT_PASSWORD_REQUEST:
        return <ForgotPasswordRequest />;
      case FORGOT_PASSWORD_SUBMIT:
        return <ForgotPasswordSubmit />;
      case RESET_PASSWORD:
        return <RequireNewPassword />;
      case TOTP_SETUP:
        return <TOTPSetup />;
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
            src="./assets/ltl-logo.png"
            alt=""
          />
          {renderAuthComponent()}
        </div>
      )}
    </>
  );
}
