import React, { useState } from "react";
import "../App.css";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { Auth } from "@aws-amplify/auth";
import { API } from "@aws-amplify/api";
import { SUBMIT } from "./FixedSectionTypes";
import SectionBottomNavigation from "./SectionBottomNavigation";
import { SIGNED_IN } from "../model/AuthStates";
import Modal from "@material-ui/core/Modal";

export const SUBMITTING_START = "Uploading survey response";
export const SUBMITTING_PHOTOS = "Uploading photos";
export const SUBMITTING_CONFIRM = "Confirming upload";
export const SUBMIT_COMPLETE = "Upload complete";
export const SUBMIT_FAILED = "Upload failed - please try again";

const API_NAME = "ltlClientApi";

function submitSurvey(request) {
  console.log("API configure", API.configure());

  console.log("POST survey", request);
  return API.post(API_NAME, "/survey", request);
}

async function uploadPhoto(
  photoId,
  uploadUrl,
  photos,
  progressIncrementCallback
) {
  console.log("uploadPhoto", photoId, uploadUrl);

  const photo = photos[photoId];
  if (photo === undefined) {
    return Promise.reject("Photo not found: " + photoId);
  }
  const imageData = Buffer.from(photo.imageData, "base64");

  const response = await fetch(uploadUrl, {
    method: "put",
    body: imageData,
    headers: {
      "Content-Type": "image",
    },
  });
  console.log("uploadPhoto response", response);
  if (response.ok) {
    console.log("uploadPhoto succeeded");
    progressIncrementCallback();
    return Promise.resolve("uploadPhoto succeeded");
  } else {
    console.log("uploadPhoto failed");
    return Promise.reject("uploadPhoto failed");
  }
}

function uploadPhotos({ uploadUrls }, photos, progressIncrementCallback) {
  console.log("uploadPhotos", uploadUrls);
  const photoIds = Object.keys(uploadUrls);
  console.log("photoIDs", photoIds);

  return Promise.all(
    photoIds.map((photoId) =>
      uploadPhoto(
        photoId,
        uploadUrls[photoId],
        photos,
        progressIncrementCallback
      )
    )
  );
}

function confirmsurvey(request) {
  console.log("POST confirmsurvey", request);
  return API.post(API_NAME, "/confirmsurvey", request);
}

function SubmitSection({ sections, setCurrentSection }) {
  const state = useSelector((state) => state);
  const authState = useSelector((state) => state.authentication.state);
  const user = useSelector((state) => state.authentication.user);

  const [submitState, setSubmitState] = useState(null);
  const [submitProgress, setSubmitProgress] = useState(0);

  const incrementProgress = () => setSubmitProgress((progress) => progress + 1);

  async function uploadResults() {
    console.log("Results:");
    console.log(JSON.stringify(state.answers));
    console.log(JSON.stringify(state.photoDetails));

    const authToken = `Bearer ${(await Auth.currentSession())
      .getIdToken()
      .getJwtToken()}`;

    const requestTemplate = {
      mode: "cors",
      body: {
        uuid: uuidv4(),
      },
      headers: {
        Authorization: authToken,
      },
    };

    const submitRequest = { ...requestTemplate };
    submitRequest.body = {
      ...requestTemplate.body,
      survey: state.answers,
      // photos: state.photos,
      photoDetails: state.photoDetails,
    };
    submitRequest.body.survey.background.email = {
      answer: user.attributes.email,
    };

    const confirmRequest = { ...requestTemplate };

    setSubmitState(SUBMITTING_START);
    setSubmitProgress(0);

    submitSurvey(submitRequest)
      .then((response) => {
        console.log("submitSurvey complete", response);
        incrementProgress();
        confirmRequest.body.confirmId = response.confirmId;
        setSubmitState(SUBMITTING_PHOTOS);
        return uploadPhotos(response, state.photos, incrementProgress);
      })
      .then((response) => {
        console.log("uploadPhotos complete", response);
        setSubmitState(SUBMITTING_CONFIRM);
        return confirmsurvey(confirmRequest);
      })
      .then((response) => {
        console.log("confirmsurvey complete", response);
        incrementProgress();
        setSubmitState(SUBMIT_COMPLETE);
      })
      .catch((err) => {
        console.log("Error");
        console.log(err);
        setSubmitState(SUBMIT_FAILED);
      });
  }

  const maxProgressCount = Object.keys(state.photos).length + 2;
  const progressValue = Math.round((submitProgress * 100) / maxProgressCount);

  return (
    <div className="section submit">
      {authState !== SIGNED_IN ? (
        <p>Login before submitting survey.</p>
      ) : (
        <button className="submit-survey-button" onClick={uploadResults}>
          <span>UPLOAD…</span>
        </button>
      )}
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
                className="save-photos-button"
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
