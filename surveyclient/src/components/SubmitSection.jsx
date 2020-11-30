import React from "react";
import "../App.css";
import { useSelector } from "react-redux";
import Button from "@material-ui/core/Button";
import { v4 as uuidv4 } from "uuid";
import { API } from "aws-amplify";
import { Auth } from "aws-amplify";
import { SUBMIT } from "./FixedSectionTypes";
import SectionBottomNavigation from "./SectionBottomNavigation";

function SubmitSection({ sections, setCurrentSection }) {
  const state = useSelector((state) => state);

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
      <Button
        className="submit-survey"
        variant="outlined"
        color="primary"
        onClick={uploadResults}
      >
        Upload...
      </Button>
      <SectionBottomNavigation
        sections={sections}
        currentSectionId={SUBMIT}
        setCurrentSectionId={setCurrentSection}
      />
    </div>
  );
}

export default SubmitSection;
