import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN } from "../../model/AuthStates";
import { setAuthState, completeNewPassword } from "../../model/AuthActions";

const PASSWORD_ID = "passwordInput";
const MIN_PASSWORD_LENGTH = 8;

export default function RequireNewPassword() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authentication.user);
  const authState = useSelector((state) => state.authentication.state);
  const authError = useSelector((state) => state.authentication.errorMessage);

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    setLoading(false);
  }, [authState, authError]);

  function handleComplete() {
    setLoading(true);
    dispatch(completeNewPassword(user, password));
  }

  return (
    <>
      <h2>Change Password</h2>

      <label htmlFor={PASSWORD_ID}>New password</label>
      <input
        id={PASSWORD_ID}
        type="password"
        onInput={(event) => {
          setPassword(event.target.value);
        }}
        placeholder="Enter your new password"
      />

      <div className="action-row">
        <button
          id="change-button"
          onClick={handleComplete}
          disabled={loading || password.length < MIN_PASSWORD_LENGTH}
        >
          {loading ? <div class="loader" /> : <span>CHANGE</span>}
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
