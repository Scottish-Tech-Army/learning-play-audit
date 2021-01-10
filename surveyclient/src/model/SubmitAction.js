import { v4 as uuidv4 } from "uuid";
import { Auth } from "@aws-amplify/auth";
import axios from "axios";
import {
  SUBMITTING_START,
  SUBMITTING_PHOTOS,
  SUBMITTING_CONFIRM,
  SUBMIT_COMPLETE,
  SUBMIT_FAILED,
} from "./SubmitStates";

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
  console.log("POST survey"); //, headers, body);
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

export function uploadResults(
  setSubmitState,
  setProgressValue,
  state,
  endpoint
) {
  // console.log("Results:");
  // console.log(JSON.stringify(state.answers));
  // console.log(JSON.stringify(state.photoDetails));

  let progress = 0;
  const maxProgressCount = Object.keys(state.photos).length + 2;

  const incrementProgress = () => {
    progress++;
    setProgressValue(Math.round((progress * 100) / maxProgressCount));
  };

  const user = state.authentication.user;

  const uuid = uuidv4();
  let confirmId = null;

  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
  };
  setProgressValue(0);
  setSubmitState(SUBMITTING_START);

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
