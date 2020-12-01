import React, { useState } from "react";
import { Auth } from "@aws-amplify/auth";
import { handleSignIn, setAuthError, setAuthState } from "./utils";
import { useDispatch } from "react-redux";
import { SIGN_IN, CONFIRM_SIGN_UP } from "../../model/AuthStates";

const EMAIL_ID = "emailInput";
const PASSWORD_ID = "passwordInput";

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

  async function signUp(event) {
    if (event) {
      event.preventDefault();
    }

    const signUpAttributes = {
      username: email,
      password: password,
    };
    try {
      setLoading(true);
      const data = await Auth.signUp(signUpAttributes);
      if (!data) {
        throw new Error("Sign Up Failed");
      }
      if (data.userConfirmed) {
        await handleSignIn(
          dispatch,
          signUpAttributes.username,
          signUpAttributes.password
        );
      } else {
        dispatch(
          setAuthState(CONFIRM_SIGN_UP, {
            ...data.user,
            signUpAttrs: { ...signUpAttributes },
          })
        );
      }
    } catch (error) {
      dispatch(setAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2>Register</h2>

      <label htmlFor={EMAIL_ID}>Email Address*</label>
      <input
        id={EMAIL_ID}
        type="email"
        onInput={(event) => setEmail(event.target.value)}
        placeholder="Email"
      />

      <label htmlFor={PASSWORD_ID}>Password*</label>
      <input
        id={PASSWORD_ID}
        type="password"
        onInput={(event) => setPassword(event.target.value)}
        placeholder="Password"
      />

      <button onClick={signUp} disabled={loading}>
        {loading ? <amplify-loading-spinner /> : <span>REGISTER</span>}
      </button>
      <div className="question">
        Already have an account?{" "}
        <button
          className="inline-action"
          onClick={() => dispatch(setAuthState(SIGN_IN))}
        >
          Sign In
        </button>
      </div>
    </>
  );
}
