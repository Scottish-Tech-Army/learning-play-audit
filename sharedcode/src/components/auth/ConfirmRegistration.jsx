import React, { useEffect, useState } from "react";
import { setAuthState } from "../../model/AuthActions";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN } from "../../model/AuthStates";
import {
  resendConfirmCode,
  confirmRegistration,
} from "../../model/AuthActions";

const EMAIL_ID = "confirmEmailInput";
const CODE_ID = "codeInput";

export default function ConfirmRegistration() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authentication.user);
  const authState = useSelector((state) => state.authentication.state);
  const authError = useSelector((state) => state.authentication.errorMessage);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const _signUpAttrs = user && user.signUpAttrs ? user.signUpAttrs : null;

  useEffect(() => {
    setLoading(false);
  }, [authState, authError]);

  function handleResend() {
    dispatch(resendConfirmCode(user));
  }

  function handleConfirm() {
    setLoading(true);
    dispatch(confirmRegistration(user, code, _signUpAttrs));
  }

  return (
    <>
      <h2>Confirm Sign up</h2>

      <label htmlFor={EMAIL_ID}>Email Address</label>
      <input
        id={EMAIL_ID}
        type="email"
        value={user ? user.username : ""}
        readOnly={true}
      />

      <label htmlFor={CODE_ID}>Confirmation Code</label>
      <input
        id={CODE_ID}
        type="number"
        onInput={(event) => setCode(event.target.value)}
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
          onClick={() => dispatch(setAuthState(SIGN_IN, user))}
        >
          Back to Sign In
        </button>
      </div>
    </>
  );
}
