import React from "react";
import "../App.css";
import Modal from "@material-ui/core/Modal";

export default function ConfirmDialog({
  closeDialog,
  yesText = "YES",
  noText = "NO",
  children,
}) {
  return (
    <Modal
      id="dialog-container"
      container={window !== undefined ? () => window.document.body : undefined}
      keepMounted={false}
      open={true}
      onClose={() => closeDialog(false)}
    >
      <div className="dialog confirm">
        {children}
        <div className="action-row">
          <button
            id="yes-button"
            onClick={() => closeDialog(true)}
            aria-label={yesText}
          >
            {yesText}
          </button>
          <button
            id="no-button"
            onClick={() => closeDialog(false)}
            aria-label={noText}
          >
            {noText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
