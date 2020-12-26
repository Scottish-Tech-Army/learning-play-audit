import React, { useState, useEffect } from "react";
import { checkContact } from "./utils";
import { Auth } from "@aws-amplify/auth";
import { ConsoleLogger as Logger } from "@aws-amplify/core";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN } from "../../model/AuthStates";
import { setAuthError, setAuthState } from "./utils";
import ContinueSignedOutButton from "./ContinueSignedOutButton";

const logger = new Logger("amplify-require-new-password");

const PASSWORD_ID = "passwordInput";

export default function RequireNewPassword() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authentication.user);
  const authState = useSelector((state) => state.authentication.state);
  const authError = useSelector((state) => state.authentication.errorMessage);

  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!user) {
      async function getAuthenticatedUser() {
        // Check for authenticated user
        try {
          const authenticatedUser = await Auth.currentAuthenticatedUser();
          if (authenticatedUser) setCurrentUser(authenticatedUser);
        } catch (error) {
          dispatch(setAuthError(error));
        }
      }

      getAuthenticatedUser();
    }
  }, [user, dispatch]);

  useEffect(() => {
    setLoading(false);
  }, [authState, authError]);

  async function completeNewPassword(event: Event) {
    if (event) {
      event.preventDefault();
    }

    setLoading(true);
    try {
      const user = await Auth.completeNewPassword(currentUser, password, {});

      logger.debug("complete new password", user);
      dispatch(checkContact(user));
    } catch (error) {
      dispatch(setAuthError(error));
    }
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
        <button onClick={completeNewPassword} disbled={loading}>
          {loading ? <div class="loader" /> : <span>CHANGE</span>}
        </button>
        <ContinueSignedOutButton />
      </div>
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
