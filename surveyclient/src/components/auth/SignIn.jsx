import React, { useEffect, useState } from "react";
import { signIn, setAuthState } from "../../model/AuthActions";
import { useDispatch, useSelector } from "react-redux";
import { REGISTER, FORGOT_PASSWORD_REQUEST } from "../../model/AuthStates";

const EMAIL_ID = "emailInput";
const PASSWORD_ID = "passwordInput";

export default function SignIn() {
  const authState = useSelector((state) => state.authentication.state);
  const authError = useSelector((state) => state.authentication.errorMessage);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(false);
  }, [authState, authError]);

  function handleSignIn() {
    setLoading(true);
    dispatch(signIn(email, password));
  }

  return (
    <>
      <h2>Login</h2>

      <label htmlFor={EMAIL_ID}>Email address</label>
      <input
        id={EMAIL_ID}
        type="email"
        onInput={(event) => setEmail(event.target.value)}
        placeholder={"Enter your email address"}
      />

      <label htmlFor={PASSWORD_ID}>Password</label>
      <input
        id={PASSWORD_ID}
        type="password"
        onInput={(event) => setPassword(event.target.value)}
        placeholder={"Enter your password"}
      />
      <div className="question">
        Forgot your password?{" "}
        <button
          id="forgot-password-button"
          className="inline-action"
          onClick={() => dispatch(setAuthState(FORGOT_PASSWORD_REQUEST))}
        >
          Reset password
        </button>
      </div>
      <div className="action-row">
        <button
          id="signin-button"
          onClick={handleSignIn}
          disabled={loading || email.length === 0 || password.length === 0}
        >
          {loading ? <div class="loader" /> : <span>LOGIN</span>}
        </button>
      </div>
      <div className="question">
        Don't have an account?{" "}
        <button
          id="register-button"
          className="inline-action"
          onClick={() => dispatch(setAuthState(REGISTER))}
        >
          Register
        </button>
      </div>
    </>
  );
}
