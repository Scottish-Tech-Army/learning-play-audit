import React, { useState } from "react";
import { Auth } from "@aws-amplify/auth";
import { Logger } from "@aws-amplify/core";
import { useDispatch } from "react-redux";
import { SIGN_IN } from "../../model/AuthStates";
import { setAuthError, setAuthState } from "./utils";

const EMAIL_ID = "emailInput";
const CODE_ID = "codeInput";
const PASSWORD_ID = "passwordInput";

const logger = new Logger("ForgotPassword");

export default function ForgotPassword() {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const dispatch = useDispatch();

  async function send(event) {
    if (event) {
      event.preventDefault();
    }
    setLoading(true);

    try {
      const data = await Auth.forgotPassword(email);
      logger.debug(data);
      setDelivery(data.CodeDeliveryDetails);
    } catch (error) {
      dispatch(setAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: Event) {
    if (event) {
      event.preventDefault();
    }
    setLoading(true);
    try {
      const data = await Auth.forgotPasswordSubmit(email, code, password);
      logger.debug(data);
      dispatch(setAuthState(SIGN_IN));
      setDelivery(null);
    } catch (error) {
      dispatch(setAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2>Reset your password</h2>

      {delivery ? (
        <>
          <label htmlFor={CODE_ID}>Verification code</label>
          <input
            id={CODE_ID}
            type="number"
            onInput={(event) => setCode(event.target.value)}
            placeholder="Enter code"
            min="0"
          />

          <label htmlFor={PASSWORD_ID}>New password</label>
          <input
            id={PASSWORD_ID}
            type="password"
            onInput={(event) => {
              setPassword(event.target.value);
            }}
            placeholder="Enter your new password"
          />
        </>
      ) : (
        <>
          <label htmlFor={EMAIL_ID}>Email Address *</label>
          <input
            id={EMAIL_ID}
            type="email"
            onInput={(event) => {
              setEmail(event.target.value);
            }}
            placeholder="Enter your email address"
          />
        </>
      )}
      <button onClick={delivery ? submit : send} disabled={loading}>
        {loading ? (
          <amplify-loading-spinner />
        ) : (
          <span>{delivery ? "SUBMIT" : "SEND CODE"}</span>
        )}
      </button>
      <div className="question">
        <button
          className="inline-action"
          onClick={() => dispatch(setAuthState(SIGN_IN))}
        >
          Back to Sign In
        </button>
      </div>
    </>
  );
}
