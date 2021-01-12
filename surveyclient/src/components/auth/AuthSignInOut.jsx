import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SIGN_IN, SIGNED_OUT, SIGNED_IN } from "../../model/AuthStates";
import { setAuthState, signOut } from "../../model/AuthActions";
import "../../App.css";
import Modal from "@material-ui/core/Modal";

function ConfirmDialog({ closeDialog }) {
  return (
    <Modal
      id="dialog-container"
      container={window !== undefined ? () => window.document.body : undefined}
      keepMounted={false}
      open={true}
      onClose={() => closeDialog(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="dialog confirm-log-out"
        aria-labelledby="form-dialog-title"
      >
        <h2 className="title">Log out?</h2>
        <p>Are you sure you want to log out?</p>
        <button
          className="save-note-button"
          onClick={() => closeDialog(true)}
          aria-label="Add To Survey"
        >
          Yes
        </button>
        <button
          className="save-note-button"
          onClick={() => closeDialog(false)}
          aria-label="Add To Survey"
        >
          No
        </button>
      </div>
    </Modal>
  );
}

export default function AuthSignInOut() {
  const [signedIn, setSignedIn] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
    signedIn ? setShowConfirmDialog(true) : dispatch(setAuthState(SIGN_IN));
  }

  return (
    <>
      <button
        aria-label={signedIn ? "Log out" : "Log in"}
        onClick={handleClick}
        id="auth-signin-signout"
      >
        {signedIn ? "LOG OUT" : "LOG IN"}
      </button>
      {showConfirmDialog && (
        <ConfirmDialog
          closeDialog={(closeConfirmed) => {
            closeConfirmed && dispatch(signOut());
            setShowConfirmDialog(false);
          }}
        />
      )}
    </>
  );
}
