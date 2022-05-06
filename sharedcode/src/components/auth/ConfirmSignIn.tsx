import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  SIGN_IN,
  MFA_OPTION_TOTP,
  MFA_OPTION_SMS,
  SOFTWARE_TOKEN_MFA,
} from "../../model/AuthStates";
import { setAuthState, confirmSignIn } from "../../model/AuthActions";
import {
  getAuthError,
  getAuthState,
  getSurveyUser,
} from "../../model/AuthStore";

const CODE_ID = "codeInput";

export default function ConfirmSignIn() {
  const dispatch = useDispatch();
  const user = useSelector(getSurveyUser)!;
  const authState = useSelector(getAuthState);
  const authError = useSelector(getAuthError);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const mfaOption =
    user.cognitoUser!.challengeName === SOFTWARE_TOKEN_MFA
      ? MFA_OPTION_TOTP
      : MFA_OPTION_SMS;

  useEffect(() => {
    setLoading(false);
  }, [authState, authError]);

  function handleConfirm() {
    setLoading(true);
    dispatch(confirmSignIn(user, code, mfaOption));
  }

  return (
    <>
      <h2>
        {mfaOption === MFA_OPTION_TOTP
          ? "Confirm TOTP Code"
          : "Confirm SMS Code"}
      </h2>

      <label htmlFor={CODE_ID}>Code</label>
      <input
        id={CODE_ID}
        type="number"
        onInput={(event) => setCode((event.target as HTMLInputElement).value)}
        placeholder="Enter your code"
        min="0"
      />

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
