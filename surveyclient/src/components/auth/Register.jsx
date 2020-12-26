import React, { useState } from "react";
import { Auth } from "@aws-amplify/auth";
import { handleSignIn, setAuthError, setAuthState } from "./utils";
import { useDispatch } from "react-redux";
import { SIGN_IN, CONFIRM_REGISTRATION } from "../../model/AuthStates";
import Modal from "@material-ui/core/Modal";
import ContinueSignedOutButton from "./ContinueSignedOutButton";

const EMAIL_ID = "emailInput";
const PASSWORD_ID = "passwordInput";
const MIN_PASSWORD_LENGTH = 8;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [tcChecked, setTcChecked] = useState(false);
  const [gdprChecked, setGdprChecked] = useState(false);
  const [gdprPopup, setGdprPopup] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

  const EMAIL_USE_TEXT = `Learning Through Landscapes may use this email address to contact
you in relation to this survey. Your email address will not be used
for any other purpose.`;

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
          setAuthState(CONFIRM_REGISTRATION, {
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

  function formComplete() {
    return (
      tcChecked &&
      gdprChecked &&
      email &&
      email.length > 0 &&
      password &&
      password.length >= MIN_PASSWORD_LENGTH
    );
  }

  function checkbox(labelText, value, setValue) {
    return (
      <div className="checkbox-line">
        <span
          className={"checkmark" + (value ? " checked" : "")}
          onClick={() => setValue((value) => !value)}
        ></span>
        <label>{labelText}</label>
      </div>
    );
  }

  function policyLink(linkText) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.ltl.org.uk/our-policies/"
      >
        {linkText}
      </a>
    );
  }

  return (
    <>
      <h2>Register</h2>

      <div className="email-label-line">
        <label htmlFor={EMAIL_ID}>Email Address*</label>
        <div className="tooltip large">
          Why do we need this?
          <span className="tooltip-text">{EMAIL_USE_TEXT}</span>
        </div>
        <button className="tooltip small" onClick={() => setGdprPopup(true)}>
          ?
        </button>
        <Modal
          container={
            window !== undefined ? () => window.document.body : undefined
          }
          keepMounted={false}
          open={gdprPopup}
          onClose={() => setGdprPopup(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="tooltip-popup small">
            <button
              className="close-button"
              onClick={() => setGdprPopup(false)}
              aria-label="Close"
            >
              X
            </button>
            {EMAIL_USE_TEXT}
          </div>
        </Modal>
      </div>
      <input
        id={EMAIL_ID}
        type="email"
        onInput={(event) => setEmail(event.target.value)}
        placeholder="Email"
      />

      <label htmlFor={PASSWORD_ID}>Password (minimum 8 characters)*</label>
      <input
        id={PASSWORD_ID}
        type="password"
        onInput={(event) => setPassword(event.target.value)}
        placeholder="Password"
      />

      {checkbox(
        <div>I agree to the {policyLink("Terms & Conditions")}</div>,
        tcChecked,
        setTcChecked
      )}
      {checkbox(
        <span>I agree to the {policyLink("LTL GDPR Policy")}</span>,
        gdprChecked,
        setGdprChecked
      )}

      <div className="action-row">
        <button
          className={"register-button" + (!formComplete() ? " disabled" : "")}
          onClick={signUp}
          disabled={loading || !formComplete()}
        >
          {loading ? <div class="loader" /> : <span>REGISTER</span>}
        </button>
        <ContinueSignedOutButton />
      </div>
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
