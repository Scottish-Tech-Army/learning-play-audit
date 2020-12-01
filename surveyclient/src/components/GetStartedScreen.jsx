import React from "react";
import { useDispatch } from "react-redux";
import { CONFIRM_WELCOME } from "../model/ActionTypes.js";

export default function GetStartedScreen() {
  const dispatch = useDispatch();

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
          <span>START SURVEY</span>
        </button>
      </div>
    </div>
  );
}
