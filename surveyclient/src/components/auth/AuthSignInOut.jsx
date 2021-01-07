import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN, SIGNED_OUT, SIGNED_IN } from "../../model/AuthStates";
import { setAuthState, signOut } from "../../model/AuthActions";
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

  function handleClick(event) {
    dispatch(signedIn ? signOut() : setAuthState(SIGN_IN));
  }

  return (
    <button
      aria-label={signedIn ? "Log out" : "Log in"}
      onClick={handleClick}
      id="auth-signin-signout"
    >
      {signedIn ? "LOG OUT" : "LOG IN"}
    </button>
  );
}
