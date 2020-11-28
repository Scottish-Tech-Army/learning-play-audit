import React, { useEffect, useState } from "react";
import { handleSignIn, setAuthState } from "./utils";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_UP, FORGOT_PASSWORD } from "../../model/AuthStates";

const EMAIL_ID = "emailInput";
const PASSWORD_ID = "passwordInput";

export default function SignIn() {
  const authState = useSelector((state) => state.authentication.state);
  const authError = useSelector((state) => state.authentication.errorMessage);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(false);
  }, [authState, authError]);

  async function signIn(event: Event) {
    // avoid submitting the form
    if (event) {
      event.preventDefault();
    }

    setLoading(true);

    dispatch(handleSignIn(email, password));
  }

  return (
    <form onSubmit={signIn}>
      <h3>Sign in to your account</h3>

      <label htmlFor={EMAIL_ID}>Email Address *</label>
      <input
        id={EMAIL_ID}
        type="email"
        onInput={(event) => setEmail(event.target.value)}
        placeholder={"Enter your email address"}
      />

      <label htmlFor={PASSWORD_ID}>Password *</label>
      <input
        id={PASSWORD_ID}
        type="password"
        onInput={(event) => setPassword(event.target.value)}
        placeholder={"Enter your password"}
      />
      <div>
        Forgot your password?{" "}
        <button onClick={() => dispatch(setAuthState(FORGOT_PASSWORD))}>
          Reset password
        </button>
      </div>
      <span>
        No account?{" "}
        <button onClick={() => dispatch(setAuthState(SIGN_UP))}>
          Create account
        </button>
      </span>

      <button type="submit" disabled={loading}>
        {loading ? <amplify-loading-spinner /> : <span>Sign In</span>}
      </button>
    </form>
  );
}
