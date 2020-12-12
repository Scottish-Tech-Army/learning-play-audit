import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CONFIRM_WELCOME } from "../model/ActionTypes.js";
import { surveyInProgress } from "../model/SurveyModel";

export default function GetStartedScreen() {
  const dispatch = useDispatch();
  const answerCounts = useSelector((state) => state.answerCounts);
  const photoDetails = useSelector((state) => state.photoDetails);

  function buttonText() {
    return surveyInProgress(answerCounts, photoDetails)
      ? "CONTINUE SURVEY"
      : "START SURVEY";
  }

  return (
    <div className="get-started-wrapper">
      <div className="get-started">
        <h2>Get Started!</h2>

        <p>
          The Learning Through Landscapes Learning and Play Audit Survey can be
          filled in offline outdoors.
        </p>
        <p>
          However you will need to have access to a reliable internet connection
          to be able to submit your completed answers at the end of the survey.
        </p>
        <button onClick={() => dispatch({ type: CONFIRM_WELCOME })}>
          <span>{buttonText()}</span>
        </button>
      </div>
    </div>
  );
}
