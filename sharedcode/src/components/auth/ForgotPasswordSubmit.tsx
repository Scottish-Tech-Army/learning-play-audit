import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN } from "../../model/AuthStates";
import { setAuthState, forgotPasswordSubmit } from "../../model/AuthActions";
import {
  getAuthError,
  getAuthState,
  getSurveyUser,
} from "../../model/AuthStore";

const EMAIL_ID = "emailInput";
const CODE_ID = "codeInput";
const PASSWORD_ID = "passwordInput";
const MIN_PASSWORD_LENGTH = 8;

export default function ForgotPasswordSubmit() {
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const surveyUser = useSelector(getSurveyUser);
  const authState = useSelector(getAuthState);
  const authError = useSelector(getAuthError);

  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(false);
  }, [authState, authError]);

  function submit() {
    setLoading(true);
    dispatch(forgotPasswordSubmit(surveyUser!.email, code, password));
  }

  return (
    <>
      <h2>Confirm password reset</h2>

      <>
        <label htmlFor={EMAIL_ID}>Email Address</label>
        <input
          id={EMAIL_ID}
          type="email"
          value={surveyUser!.email}
          readOnly={true}
        />
        <label htmlFor={CODE_ID}>Verification code</label>
        <input
          id={CODE_ID}
          type="number"
          onInput={(event) => setCode((event.target as HTMLInputElement).value)}
          placeholder="Enter code"
          min="0"
        />

        <label htmlFor={PASSWORD_ID}>New password</label>
        <input
          id={PASSWORD_ID}
          type="password"
          onInput={(event) => {
            setPassword((event.target as HTMLInputElement).value);
          }}
          placeholder="Enter your new password"
        />
      </>
      <div className="action-row">
        <button
          id="submit-button"
          onClick={submit}
          disabled={
            loading ||
            code.length === 0 ||
            password.length < MIN_PASSWORD_LENGTH
          }
        >
          {loading ? <div className="loader" /> : <span>{"SUBMIT"}</span>}
        </button>
      </div>
      <div className="question">
        <button
          id="signin-button"
          className="inline-action start-of-line"
          onClick={() => dispatch(setAuthState(SIGN_IN))}
        >
          Back to Sign In
        </button>
      </div>
    </>
  );
}
