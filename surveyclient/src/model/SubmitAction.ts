import { v4 as uuidv4 } from "uuid";
import { Auth } from "@aws-amplify/auth";
import axios, { AxiosPromise, AxiosRequestHeaders } from "axios";
import {
  SUBMITTING_START,
  SUBMITTING_PHOTOS,
  SUBMITTING_CONFIRM,
  SUBMIT_COMPLETE,
  SUBMIT_FAILED,
} from "./SubmitStates";

import { Buffer } from "buffer/";
import {
  Photo,
  PhotoDetails,
  SurveyAnswers,
  SurveyStoreState,
} from "./SurveyModel";

function uploadPhoto(
  photoId: string,
  uploadUrl: string,
  photo: Photo,
  progressIncrementCallback: () => void
) {
  console.debug("uploadPhoto", photoId, uploadUrl);

  const imageData = Buffer.from(photo.imageData, "base64");

  return axios
    .put(uploadUrl, imageData, { headers: { "Content-Type": "image" } })
    .then((response) => {
      console.debug("uploadPhoto response", response);
      if (response.status === 200) {
        console.debug("uploadPhoto succeeded");
        progressIncrementCallback();
        return Promise.resolve("uploadPhoto succeeded");
      } else {
        console.debug("uploadPhoto failed");
        return Promise.reject("uploadPhoto failed");
      }
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

function uploadPhotos(
  { uploadUrls }: SubmitSurveyResponse,
  photos: Record<string, Photo>,
  progressIncrementCallback: () => void
) {
  console.debug("uploadPhotos", uploadUrls);
  const photoIds = photos ? Object.keys(photos) : [];
  console.debug("photoIDs", photoIds);

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

function checkUploadPhotoUrls(
  { uploadUrls }: SubmitSurveyResponse,
  photos: Record<string, Photo>
) {
  console.debug("checkUploadPhotoUrls", uploadUrls);
  const photoIds = photos ? Object.keys(photos) : [];

  photoIds.forEach((photoId) => {
    if (!uploadUrls || !uploadUrls[photoId]) {
      throw new Error("Upload URL not found for photoId " + photoId);
    }
  });
}

interface SubmitSurveyBody {
  uuid: string;
  survey: SurveyAnswers;
  photoDetails: Record<string, PhotoDetails>;
}

interface SubmitSurveyResponse {
  uploadUrls: Record<string, string>;
  confirmId: string;
}

function submitSurvey(
  endpoint: string,
  headers: AxiosRequestHeaders,
  body: SubmitSurveyBody
): AxiosPromise<SubmitSurveyResponse> {
  console.debug("POST survey"); //, headers, body);
  return axios
    .post(endpoint + "/survey", JSON.stringify(body), { headers: headers })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

interface ConfirmSurveyBody {
  uuid: string;
  confirmId: string;
}

function confirmsurvey(
  endpoint: string,
  headers: AxiosRequestHeaders,
  body: ConfirmSurveyBody
): AxiosPromise {
  console.debug("POST confirmsurvey", headers, body);
  return axios
    .post(endpoint + "/confirmsurvey", JSON.stringify(body), {
      headers: headers,
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

export function uploadResults(
  setSubmitState: (state: string) => void,
  setProgressValue: (value: number) => void,
  state: SurveyStoreState,
  endpoint: string
) {
  console.debug(
    "Results:",
    JSON.stringify(state.answers),
    JSON.stringify(state.photoDetails)
  );

  let progress = 0;
  const maxProgressCount = Object.keys(state.photos).length + 2;

  const incrementProgress = () => {
    progress++;
    setProgressValue(Math.round((progress * 100) / maxProgressCount));
  };

  const { username, email } = state.surveyUser!;

  const uuid = uuidv4();
  let confirmId: string;

  const headers: AxiosRequestHeaders = {
    "Content-Type": "application/json; charset=UTF-8",
  };
  setProgressValue(0);
  setSubmitState(SUBMITTING_START);
  return Auth.currentSession()
  .then((session) => {
    headers.Authorization = `Bearer ${session.getIdToken().getJwtToken()}`;
    
    if (!username || !email) {
      throw new Error("User email missing");
    }
    const submitRequest = {
      uuid: uuid,
      survey: state.answers,
      photoDetails: state.photoDetails,
      surveyVersion: state.surveyVersion,
    };
    submitRequest.survey.background.email = {
      answer: email,
      comments: "",
    };
    
    return submitSurvey(endpoint, headers, submitRequest);
  })
  .then((response) => {
      console.debug("submitSurvey complete", response);
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
      console.debug("uploadPhotos complete", response);
      setSubmitState(SUBMITTING_CONFIRM);
      return confirmsurvey(endpoint, headers, {
        uuid: uuid,
        confirmId: confirmId,
      });
    })
    .then((response) => {
      console.debug("confirmsurvey complete", response);
      if (response.status !== 200) {
        throw new Error(JSON.stringify(response));
      }
      incrementProgress();
      setSubmitState(SUBMIT_COMPLETE);
    })
    .catch((err) => {
      console.error(err);
      setSubmitState(SUBMIT_FAILED);
    });
}
