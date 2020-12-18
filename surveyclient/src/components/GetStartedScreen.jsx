import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CONFIRM_WELCOME } from "../model/ActionTypes.js";

export default function GetStartedScreen({ canInstall, downloadButton }) {
  const dispatch = useDispatch();
  const hasEverLoggedIn = useSelector((state) => state.hasEverLoggedIn);

  function buttonText() {
    return hasEverLoggedIn ? "CONTINUE SURVEY" : "START SURVEY HERE";
  }

  return (
    <div className="get-started-wrapper">
      <div className="get-started">
        <img className="title-logo-small" src="./assets/ltl-logo.jpg" alt="" />
        <h2>Get Started!</h2>

        <p>
          The Learning Through Landscapes Learning and Play Audit Survey can be
          filled in offline outdoors.
        </p>
        <p>
          However you will need to have access to a reliable internet connection
          to be able to submit your completed answers at the end of the survey.
        </p>
        {canInstall && (
          <p>
            You can either fill in the survey here in your brower, or download
            it as an app using the Install button.
          </p>
        )}
        <div className="action-row">
          <button onClick={() => dispatch({ type: CONFIRM_WELCOME })}>
            <span>{buttonText()}</span>
          </button>
          {downloadButton}
        </div>
      </div>
    </div>
  );
}
