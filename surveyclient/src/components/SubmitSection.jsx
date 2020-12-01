import React from "react";
import "../App.css";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { API } from "aws-amplify";
import { Auth } from "aws-amplify";
import { SUBMIT } from "./FixedSectionTypes";
import SectionBottomNavigation from "./SectionBottomNavigation";
import { SIGNED_IN } from "../model/AuthStates";

function SubmitSection({ sections, setCurrentSection }) {
  const state = useSelector((state) => state);
  const authState = useSelector((state) => state.authentication.state);
  const user = useSelector((state) => state.authentication.user);

  async function uploadResults() {
    console.log("Results:");
    console.log(JSON.stringify(state.answers));
    console.log(JSON.stringify(state.photoDetails));

    const request = {
      mode: "cors",
      body: {
        uuid: uuidv4(),
        survey: state.answers,
        photos: state.photos,
        photoDetails: state.photoDetails,
      },
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
      },
    };

    request.body.survey.background.email = { answer: user.attributes.email };

    API.post("ltlClientApi", "/survey", request)
      .then((result) => {
        console.log("Success");
        console.log(JSON.parse(result.body));
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
