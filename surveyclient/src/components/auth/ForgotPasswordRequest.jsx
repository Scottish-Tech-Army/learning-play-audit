import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN } from "../../model/AuthStates";
import { setAuthState, forgotPasswordRequest } from "../../model/AuthActions";

const EMAIL_ID = "emailInput";

export default function ForgotPasswordRequest() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const authState = useSelector((state) => state.authentication.state);
  const authError = useSelector((state) => state.authentication.errorMessage);
  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(false);
  }, [authState, authError]);

  function send(event) {
    setLoading(true);
    dispatch(forgotPasswordRequest(email));
  }

  return (
    <>
      <h2>Reset your password</h2>

      <label htmlFor={EMAIL_ID}>Email Address *</label>
      <input
        id={EMAIL_ID}
        type="email"
        onInput={(event) => setEmail(event.target.value)}
        placeholder="Enter your email address"
      />
      <div className="action-row">
        <button
          id="request-button"
          onClick={send}
          disabled={loading || email.length === 0}
        >
          {loading ? <div class="loader" /> : <span>SEND CODE</span>}
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
