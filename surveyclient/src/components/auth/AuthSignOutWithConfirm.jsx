import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { signOut } from "learning-play-audit-shared";
import ConfirmDialog from "../ConfirmDialog";
import "../../App.css";

export default function AuthSignOutWithConfirm() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const dispatch = useDispatch();

  return (
    <>
      <button
        aria-label="Log out"
        onClick={() => setShowConfirmDialog(true)}
        id="auth-signout"
      >
        LOG OUT
      </button>
      {showConfirmDialog && (
        <ConfirmDialog
          yesText="LOG OUT"
          noText="Cancel"
          closeDialog={(closeConfirmed) => {
            closeConfirmed && dispatch(signOut());
            setShowConfirmDialog(false);
          }}
        >
          <p>Are you sure you want to Log Out?</p>
          <p>
            You will not be able to continue your survey and you will need
            access to an internet connection to Login again.
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}
