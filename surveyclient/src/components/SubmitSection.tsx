import React, { useState } from "react";
import "../App.css";
import { useSelector, useDispatch } from "react-redux";
import SectionBottomNavigation from "./SectionBottomNavigation";
import Modal from "@material-ui/core/Modal";
import { uploadResults } from "../model/SubmitAction";
import { RESET_STATE } from "../model/ActionTypes";
import { SIGNED_IN, signOut, getAuthState } from "learning-play-audit-shared";
import { SUBMIT_COMPLETE, SUBMIT_FAILED } from "../model/SubmitStates";
import ConfirmDialog from "./ConfirmDialog";
import { SurveyStoreState } from "../model/SurveyModel";

export interface SubmitSectionProps {
  endpoint: string;
}

function SubmitSection({ endpoint }: SubmitSectionProps) {
  const dispatch = useDispatch();
  const allState = useSelector((state: SurveyStoreState) => state);
  const authState = useSelector(getAuthState);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [submitState, setSubmitState] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  function handleUploadResults() {
    uploadResults(setSubmitState, setProgressValue, allState, endpoint);
  }

  function handleCloseDialog() {
    if (submitState === SUBMIT_COMPLETE) {
      dispatch({ type: RESET_STATE });
      dispatch(signOut());
    }
    setSubmitState(null);
  }

  return (
    <div className="section submit">
      <h1 className="title">Upload survey response</h1>
      <p>
        Upload your completed survey to send your answers to Learning through
        Landscapes.
      </p>
      <p>
        You will not be able to access or make changes to your survey responses
        once your survey has been uploaded.
      </p>
      <div className="submit-content">
        {authState !== SIGNED_IN ? (
          <p>Login before submitting survey.</p>
        ) : (
          <>
            <button
              className="submit-survey-button"
              onClick={() => setShowConfirmDialog(true)}
            >
              <span>UPLOAD…</span>
            </button>
            {showConfirmDialog && (
              <ConfirmDialog
                yesText="Upload Survey"
                noText="Cancel"
                closeDialog={(closeConfirmed) => {
                  closeConfirmed && handleUploadResults();
                  setShowConfirmDialog(false);
                }}
              >
                <p>Are you sure you want to Upload your survey?</p>
                <p>
                  You will not be able to access or make changes to your survey
                  once it has been uploaded.
                </p>
              </ConfirmDialog>
            )}
          </>
        )}
      </div>
      <SectionBottomNavigation />
      {submitState !== null && (
        <Modal
          id="dialog-container"
          container={
            window !== undefined ? () => window.document.body : undefined
          }
          keepMounted={false}
          disableBackdropClick={true}
          disableEscapeKeyDown={true}
          open={submitState !== null}
        >
          <div className="dialog submit">
            <h2 className="title">Uploading Survey Response</h2>
            {submitState !== SUBMIT_COMPLETE &&
              submitState !== SUBMIT_FAILED && <p>Please wait...</p>}
            {submitState === SUBMIT_COMPLETE && (
              <p>Thank you for completing the survey</p>
            )}
            <div className="progress-bar">
              <div
                className="progress-bar-active"
                style={{ width: progressValue + "%" }}
              />
            </div>
            <div className="submission-status">{submitState}</div>
            {(submitState === SUBMIT_COMPLETE ||
              submitState === SUBMIT_FAILED) && (
              <button
                className="close-button"
                onClick={handleCloseDialog}
                aria-label={submitState === SUBMIT_COMPLETE ? "logout" : "Done"}
              >
                {submitState === SUBMIT_COMPLETE ? "LOG OUT" : "OK"}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SubmitSection;
