import React, { useState } from "react";
import "../App.css";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { Auth } from "@aws-amplify/auth";
import { SUBMIT } from "./FixedSectionTypes";
import SectionBottomNavigation from "./SectionBottomNavigation";
import { SIGNED_IN } from "../model/AuthStates";
import Modal from "@material-ui/core/Modal";
import axios from "axios";

export const SUBMITTING_START = "Uploading survey response";
export const SUBMITTING_PHOTOS = "Uploading photos";
export const SUBMITTING_CONFIRM = "Confirming upload";
export const SUBMIT_COMPLETE = "Upload complete";
export const SUBMIT_FAILED = "Upload failed - please try again";

function uploadPhoto(photoId, uploadUrl, photo, progressIncrementCallback) {
  console.log("uploadPhoto", photoId, uploadUrl);

  const imageData = Buffer.from(photo.imageData, "base64");

  return axios
    .put(uploadUrl, imageData, { headers: { "Content-Type": "image" } })
    .then((response) => {
      console.log("uploadPhoto response", response);
      if (response.status === 200) {
        console.log("uploadPhoto succeeded");
        progressIncrementCallback();
        return Promise.resolve("uploadPhoto succeeded");
      } else {
        console.log("uploadPhoto failed");
        return Promise.reject("uploadPhoto failed");
      }
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

function uploadPhotos({ uploadUrls }, photos, progressIncrementCallback) {
  console.log("uploadPhotos", uploadUrls);
  const photoIds = photos ? Object.keys(photos) : [];
  console.log("photoIDs", photoIds);

  return Promise.all(
    photoIds.map((photoId) =>
      uploadPhoto(
        photoId,
        uploadUrls[photoId],
        photos[photoId],
        progressIncrementCallback
      )
    )
  );
}

function checkUploadPhotoUrls({ uploadUrls }, photos) {
  console.log("checkUploadPhotoUrls", uploadUrls);
  const photoIds = photos ? Object.keys(photos) : [];

  photoIds.forEach((photoId) => {
    if (!uploadUrls || !uploadUrls[photoId]) {
      throw new Error("Upload URL not found for photoId " + photoId);
    }
  });
}

function submitSurvey(endpoint, headers, body) {
  console.log("POST survey");//, headers, body);
  return post(endpoint, "/survey", headers, body);
}

function confirmsurvey(endpoint, headers, body) {
  console.log("POST confirmsurvey", headers, body);
  return post(endpoint, "/confirmsurvey", headers, body);
}

function post(endpoint, action, headers, body) {
  return axios
    .post(endpoint + action, JSON.stringify(body), { headers: headers })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

function SubmitSection({ sections, setCurrentSection, endpoint }) {
  const state = useSelector((state) => state);
  const authState = useSelector((state) => state.authentication.state);
  const user = useSelector((state) => state.authentication.user);

  const [submitState, setSubmitState] = useState(null);
  const [submitProgress, setSubmitProgress] = useState(0);

  const incrementProgress = () => setSubmitProgress((progress) => progress + 1);

  function uploadResults() {
    // console.log("Results:");
    // console.log(JSON.stringify(state.answers));
    // console.log(JSON.stringify(state.photoDetails));

    const uuid = uuidv4();
    let confirmId = null;

    const headers = {
      "Content-Type": "application/json; charset=UTF-8",
    };

    return Auth.currentSession()
      .then((session) => {
        headers.Authorization = `Bearer ${session.getIdToken().getJwtToken()}`;

        if (!user || !user.attributes || !user.attributes.email) {
            throw new Error("User email missing");
        }
        const submitRequest = {
          uuid: uuid,
          survey: state.answers,
          photoDetails: state.photoDetails,
        };
        submitRequest.survey.background.email = {
          answer: user.attributes.email,
        };

        setSubmitState(SUBMITTING_START);
        setSubmitProgress(0);

        return submitSurvey(endpoint, headers, submitRequest);
      })
      .then((response) => {
        console.log("submitSurvey complete", response);
        if (
          response.status !== 200 ||
          !response.data ||
          !response.data.confirmId
        ) {
          throw new Error(JSON.stringify(response));
        }
        checkUploadPhotoUrls(response.data, state.photos);

        confirmId = response.data.confirmId;
        setSubmitState(SUBMITTING_PHOTOS);
        incrementProgress();

        return uploadPhotos(response.data, state.photos, incrementProgress);
      })
      .then((response) => {
        console.log("uploadPhotos complete", response);
        setSubmitState(SUBMITTING_CONFIRM);
        return confirmsurvey(endpoint, headers, {
          uuid: uuid,
          confirmId: confirmId,
        });
      })
      .then((response) => {
        console.log("confirmsurvey complete", response);
        if (response.status !== 200) {
          throw new Error(response);
        }
        incrementProgress();
        setSubmitState(SUBMIT_COMPLETE);
      })
      .catch((err) => {
        console.error(err);
        setSubmitState(SUBMIT_FAILED);
      });
  }

  const maxProgressCount = Object.keys(state.photos).length + 2;
  const progressValue = Math.round((submitProgress * 100) / maxProgressCount);

  return (
    <div className="section submit">
      <div className="content">
        {authState !== SIGNED_IN ? (
          <p>Login before submitting survey.</p>
        ) : (
          <button className="submit-survey-button" onClick={uploadResults}>
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
