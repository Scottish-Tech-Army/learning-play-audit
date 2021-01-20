import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ConfirmDialog from "./ConfirmDialog";
import "../App.css";
import { RESTART_SURVEY } from "../model/ActionTypes";

export default function RestartButton({ returnToStart }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const dispatch = useDispatch();

  return (
    <>
      <button
        aria-label="restart survey"
        onClick={() => setShowConfirmDialog(true)}
        id="restart-button"
      >
        RESTART SURVEY
      </button>
      {showConfirmDialog && (
        <ConfirmDialog
          yesText="Restart Survey"
          noText="Cancel"
          closeDialog={(closeConfirmed) => {
            closeConfirmed && dispatch({ type: RESTART_SURVEY });
            closeConfirmed && returnToStart();
            setShowConfirmDialog(false);
          }}
        >
          <p>Are you sure you want to Restart your survey?</p>
          <p>This will delete all your survey answers.</p>
        </ConfirmDialog>
      )}
    </>
  );
}
