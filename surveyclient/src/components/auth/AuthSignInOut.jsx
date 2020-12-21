import { Auth } from "@aws-amplify/auth";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN, SIGNED_OUT, SIGNED_IN } from "../../model/AuthStates";
import { setAuthError, setAuthState } from "./utils";
import "../../App.css";

export default function AuthSignInOut() {
  const [signedIn, setSignedIn] = useState(false);

  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authentication.state);

  useEffect(() => {
    if (authState === SIGNED_IN) {
      setSignedIn(true);
    } else if (authState === SIGNED_OUT) {
      setSignedIn(false);
    }
  }, [authState]);

  function signIn(event) {
    console.log("Pressing button", event);
    dispatch(setAuthState(SIGN_IN));
  }

  async function signOut(event) {
    if (event) event.preventDefault();

    try {
      await Auth.signOut();
      dispatch(setAuthState(SIGNED_OUT));
    } catch (error) {
      dispatch(setAuthError(error));
    }
  }

  if (!signedIn) {
    return (
      <button aria-label="Log in" onClick={signIn} className="auth-signin-signout">
        LOG IN
      </button>
    );
  }

  return (
    <button aria-label="Log out" onClick={signOut} className="auth-signin-signout">
      LOG OUT
    </button>
  );
}
