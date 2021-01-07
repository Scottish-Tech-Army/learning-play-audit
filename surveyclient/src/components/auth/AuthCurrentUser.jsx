import React from "react";
import { useSelector } from "react-redux";
import { SIGNED_IN } from "../../model/AuthStates";

export default function AuthCurrentUser() {
  const authState = useSelector((state) => state.authentication.state);
  const user = useSelector((state) => state.authentication.user);

  if (authState !== SIGNED_IN) {
    return null;
  }

  return (
    <div className="auth-current-user">
      <span className="intro-text">Logged in as </span>
      <span className="email">{user.attributes.email}</span>
    </div>
  );
}
