import { Auth } from "@aws-amplify/auth";
import React, { useState, useEffect } from "react";
import GetAppIcon from "@material-ui/icons/GetApp";
import Button from "@material-ui/core/Button";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN, SIGNED_OUT, SIGNED_IN } from "../../model/AuthStates";
import { setAuthError, setAuthState } from "./utils";

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
      <Button
        variant="contained"
        color="primary"
        disableElevation={true}
        startIcon={<GetAppIcon />}
        aria-label="Install Application"
        aria-haspopup="true"
        onClick={signIn}
      >
        Sign in
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      color="primary"
      disableElevation={true}
      startIcon={<GetAppIcon />}
      aria-label="Install Application"
      aria-haspopup="true"
      onClick={signOut}
    >
      Sign out
    </Button>
  );
}
