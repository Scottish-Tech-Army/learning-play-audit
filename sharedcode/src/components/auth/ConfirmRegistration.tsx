import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN } from "../../model/AuthStates";
import {
  setAuthState,
  resendConfirmCode,
  confirmRegistration,
} from "../../model/AuthActions";
import {
  getAuthError,
  getAuthState,
  getSurveyUser,
} from "../../model/AuthStore";

const EMAIL_ID = "confirmEmailInput";
const CODE_ID = "codeInput";

export default function ConfirmRegistration() {
  const dispatch = useDispatch();
  const surveyUser = useSelector(getSurveyUser);
  const authState = useSelector(getAuthState);
  const authError = useSelector(getAuthError);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [authState, authError]);

  function handleResend() {
    dispatch(resendConfirmCode(surveyUser!));
  }

  function handleConfirm() {
    setLoading(true);
    dispatch(confirmRegistration(surveyUser!, code));
  }

  return (
    <>
      <h2>Confirm Sign up</h2>

      <label htmlFor={EMAIL_ID}>Email Address</label>
      <input
        id={EMAIL_ID}
        type="email"
        value={surveyUser!.email}
        readOnly={true}
      />

      <label htmlFor={CODE_ID}>
        Confirmation Code (please check your email inbox including your
        junk/spam mail)
      </label>
      <input
        id={CODE_ID}
        type="number"
        onInput={(event) => setCode((event.target as HTMLInputElement).value)}
        placeholder="Enter your code"
        min="0"
      />
      <div className="question">
        Lost your code?{" "}
        <button
          id="resend-code-button"
          className="inline-action"
          onClick={handleResend}
        >
          Resend Code
        </button>
      </div>

      <div className="action-row">
        <button
          id="confirm-button"
          onClick={handleConfirm}
          disabled={loading || code.length === 0}
        >
          {loading ? <div className="loader" /> : <span>CONFIRM</span>}
        </button>
      </div>
      <div className="question">
        <button
          id="signin-button"
          className="inline-action start-of-line"
          onClick={() => dispatch(setAuthState(SIGN_IN, surveyUser))}
        >
          Back to Sign In
        </button>
      </div>
    </>
  );
}
