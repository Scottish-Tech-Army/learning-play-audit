import React, { useState } from "react";
import "../App.css";
import { useSelector } from "react-redux";
import { SUBMIT } from "./FixedSectionTypes";
import SectionBottomNavigation from "./SectionBottomNavigation";
import { SIGNED_IN } from "../model/AuthStates";
import Modal from "@material-ui/core/Modal";
import { uploadResults } from "../model/SubmitAction";
import { SUBMIT_COMPLETE, SUBMIT_FAILED } from "../model/SubmitStates";

function SubmitSection({ sections, setCurrentSection, endpoint }) {
  const state = useSelector((state) => state);
  const authState = useSelector((state) => state.authentication.state);

  const [submitState, setSubmitState] = useState(null);
  const [progressValue, setProgressValue] = useState(0);

  function handleUploadResults() {
    uploadResults(setSubmitState, setProgressValue, state, endpoint);
  }

  return (
    <div className="section submit">
      <h1 className="title">Upload survey response</h1>
      <div className="submit-content">
        {authState !== SIGNED_IN ? (
          <p>Login before submitting survey.</p>
        ) : (
          <button
            className="submit-survey-button"
            onClick={handleUploadResults}
          >
            <span>UPLOAD…</span>
          </button>
        )}
      </div>
      <SectionBottomNavigation
        sections={sections}
        currentSectionId={SUBMIT}
        setCurrentSectionId={setCurrentSection}
      />
      {submitState !== null && (
        <Modal
          container={
            window !== undefined ? () => window.document.body : undefined
          }
          keepMounted={false}
          disableBackdropClick={true}
          disableEscapeKeyDown={true}
          open={submitState !== null}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="dialog submit" aria-labelledby="form-dialog-title">
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
                onClick={() => setSubmitState(null)}
                aria-label="Done"
              >
                Done
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SubmitSection;
