import React from "react";
import "../App.css";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { API } from "aws-amplify";
import { Auth } from "aws-amplify";
import { SUBMIT } from "./FixedSectionTypes";
import SectionBottomNavigation from "./SectionBottomNavigation";
import { SIGNED_IN } from "../model/AuthStates";

function submitSurvey(request) {
  console.log("POST survey", request);
  return API.post("ltlClientApi", "/survey", request);
}

async function uploadPhoto(photoId, uploadUrl, photos) {
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
    return Promise.resolve("uploadPhoto succeeded");
  } else {
    console.log("uploadPhoto failed");
    return Promise.reject("uploadPhoto failed");
  }
}

function uploadPhotos({ uploadUrls }, photos) {
  console.log("uploadPhotos", uploadUrls);
  const photoIds = Object.keys(uploadUrls);
  console.log("photoIDs", photoIds);

  return Promise.all(
    photoIds.map((photoId) => uploadPhoto(photoId, uploadUrls[photoId], photos))
  );
}

function confirmsurvey(request) {
  console.log("POST confirmsurvey", request);
  return API.post("ltlClientApi", "/confirmsurvey", request);
}

function SubmitSection({ sections, setCurrentSection }) {
  const state = useSelector((state) => state);
  const authState = useSelector((state) => state.authentication.state);
  const user = useSelector((state) => state.authentication.user);

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

    submitSurvey(submitRequest)
      .then((response) => {
        console.log("submitSurvey complete", response);
        confirmRequest.body.confirmId = response.confirmId;
        return uploadPhotos(response, state.photos);
      })
      .then((response) => {
        console.log("uploadPhotos complete", response);
        return confirmsurvey(confirmRequest);
      })
      .then((response) => {
        console.log("confirmsurvey complete", response);
      })
      .catch((err) => {
        console.log("Error");
        console.log(err);
      });
  }

  return (
    <div className="submit-section">
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
    </div>
  );
}

export default SubmitSection;
