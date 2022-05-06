import React from "react";
import { useSelector } from "react-redux";
import { SIGNED_IN } from "../../model/AuthStates";
import { getAuthState, getSurveyUser } from "../../model/AuthStore";

export function AuthCurrentUser() {
  const authState = useSelector(getAuthState);
  const user = useSelector(getSurveyUser);

  if (authState !== SIGNED_IN) {
    return null;
  }

  return (
    <div className="auth-current-user">
      <span className="intro-text">Logged in as </span>
      <span className="email">{user!.email}</span>
    </div>
  );
}
