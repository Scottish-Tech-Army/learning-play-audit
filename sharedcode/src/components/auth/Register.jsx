import React, { useState, useEffect } from "react";
import { setAuthState, register } from "../../model/AuthActions";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN } from "../../model/AuthStates";
import Modal from "@material-ui/core/Modal";

const EMAIL_ID = "emailInput";
const PASSWORD_ID = "passwordInput";
const MIN_PASSWORD_LENGTH = 8;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [tcChecked, setTcChecked] = useState(false);
  const [gdprChecked, setGdprChecked] = useState(false);
  const [gdprPopup, setGdprPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const authState = useSelector((state) => state.authentication.state);
  const authError = useSelector((state) => state.authentication.errorMessage);
  const dispatch = useDispatch();

  const EMAIL_USE_TEXT = `Learning Through Landscapes may use this email address to contact
you in relation to this survey. Your email address will not be used
for any other purpose.`;

  useEffect(() => {
    setLoading(false);
  }, [authState, authError]);

  function handleRegister() {
    setLoading(true);
    dispatch(register(email, password));
  }

  function formComplete() {
    return (
      tcChecked &&
      gdprChecked &&
      email.length > 0 &&
      password.length >= MIN_PASSWORD_LENGTH
    );
  }

  function checkbox(id, labelText, value, setValue) {
    return (
      <div className="checkbox-line">
        <span
          id={id}
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
        <button
          id="gdpr-popup-button"
          className="tooltip small"
          onClick={() => setGdprPopup(true)}
        >
          ?
        </button>
        <Modal
          id="popup-container"
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
        "tnc-check",
        <div>I agree to the {policyLink("Terms & Conditions")}</div>,
        tcChecked,
        setTcChecked
      )}
      {checkbox(
        "gdpr-check",
        <span>I agree to the {policyLink("LTL GDPR Policy")}</span>,
        gdprChecked,
        setGdprChecked
      )}

      <div className="action-row">
        <button
          id="register-button"
          onClick={handleRegister}
          disabled={loading || !formComplete()}
        >
          {loading ? <div className="loader" /> : <span>REGISTER</span>}
        </button>
      </div>
      <div className="question">
        Already have an account?{" "}
        <button
          id="signin-button"
          className="inline-action"
          onClick={() => dispatch(setAuthState(SIGN_IN))}
        >
          Sign In
        </button>
      </div>
    </>
  );
}
