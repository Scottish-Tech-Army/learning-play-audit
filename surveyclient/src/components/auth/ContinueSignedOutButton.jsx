import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SIGNED_OUT } from "../../model/AuthStates";
import { setAuthState } from "./utils";
import "../../App.css";

export default function ContinueSignedOutButton() {
  const hasEverLoggedIn = useSelector((state) => state.hasEverLoggedIn);
  const dispatch = useDispatch();

  if (!hasEverLoggedIn) {
    return null;
  }

  return (
    <button
      className="continue-signed-out-button"
      aria-label="continue survey"
      onClick={() => dispatch(setAuthState(SIGNED_OUT))}
    >
      CONTINUE SURVEY
    </button>
  );
}
