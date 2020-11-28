import React, { useEffect, useState } from "react";
import { Auth } from "@aws-amplify/auth";
import { handleSignIn, setAuthError, setAuthState } from "./utils";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN, CONFIRM_SIGN_UP } from "../../model/AuthStates";

const EMAIL_ID = "emailInput";
const CODE_ID = "codeInput";

export default function ConfirmSignUp() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authentication.user);
  const authState = useSelector((state) => state.authentication.state);
  const authError = useSelector((state) => state.authentication.errorMessage);

  const [code, setCode] = useState();
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState(user ? user.username : null);

  const _signUpAttrs = user && user.signUpAttrs ? user.signUpAttrs : null;

  useEffect(() => {
    setLoading(false);
  }, [authState, authError]);

  async function resendConfirmCode(event) {
    if (event) {
      event.preventDefault();
    }
    try {
      if (!userInput) throw new Error("Username can not be empty");
      await Auth.resendSignUp(userInput);
      dispatch(setAuthState(CONFIRM_SIGN_UP));
    } catch (error) {
      dispatch(setAuthError(error));
    }
  }

  async function confirmSignUp(event: Event) {
    if (event) {
      event.preventDefault();
    }

    setLoading(true);

    try {
      const confirmSignUpResult = await Auth.confirmSignUp(userInput, code);

      if (!confirmSignUpResult) {
        throw new Error("Confirm Sign Up Failed");
      }
      if (
        _signUpAttrs &&
        _signUpAttrs.password &&
        _signUpAttrs.password !== ""
      ) {
        // Auto sign in user if password is available from previous workflow
        dispatch(handleSignIn(userInput, _signUpAttrs.password));
      } else {
        dispatch(setAuthState(SIGN_IN));
      }
    } catch (error) {
      dispatch(setAuthError(error));
    }
  }

  return (
    <form onSubmit={confirmSignUp}>
      <h3>Confirm Sign up</h3>

      <label htmlFor={EMAIL_ID}>Email Address *</label>
      <input
        id={EMAIL_ID}
        type="email"
        onInput={(event) => setUserInput(event.target.value)}
        placeholder={"Enter your email address"}
        value={userInput}
        disabled={userInput ? true : false}
      />

      <label htmlFor={CODE_ID}>Confirmation Code</label>
      <input
        id={CODE_ID}
        type="number"
        onInput={(event) => setCode(event.target.value)}
        placeholder="Enter your code"
        min="0"
      />
      <div>
        Lost your code? <button onClick={resendConfirmCode}>Resend Code</button>
      </div>

      <button type="submit">
        {loading ? <amplify-loading-spinner /> : <span>Confirm</span>}
      </button>
      <button onClick={() => dispatch(setAuthState(SIGN_IN))}>
        Back to Sign In
      </button>
    </form>
  );
}
