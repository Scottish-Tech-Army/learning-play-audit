import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN } from "../../model/AuthStates";
import {
  setAuthState,
  getTOTPSetupQrCode,
  verifyTOTPSetup,
  setAuthError,
} from "../../model/AuthActions";
import {
  getAuthError,
  getAuthState,
  getSurveyUser,
} from "../../model/AuthStore";

const CODE_ID = "codeInput";

export default function TOTPSetup() {
  const dispatch = useDispatch();
  const user = useSelector(getSurveyUser)!;
  const authState = useSelector(getAuthState);
  const authError = useSelector(getAuthError);

  const [code, setCode] = useState("");
  const [qrCodeImageSource, setQrCodeImageSource] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(qrCodeImageSource === undefined);
  }, [authState, authError, qrCodeImageSource]);

  useEffect(() => {
    getTOTPSetupQrCode(user)
      .then((qrCode) => setQrCodeImageSource(qrCode))
      .catch((error) => {
        console.error(error);
        dispatch(setAuthError(error));
      });
  }, [dispatch, user]);

  function handleConfirm() {
    setLoading(true);
    dispatch(verifyTOTPSetup(user, code));
  }

  return (
    <>
      <h2>Scan then enter verification code</h2>

      <img id="qr-code" src={qrCodeImageSource} alt="qrcode" />
      <label htmlFor={CODE_ID}>Enter Security Code:</label>
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
          {loading ? (
            <div className="loader" />
          ) : (
            <span>VERIFY SECURITY TOKEN</span>
          )}
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
