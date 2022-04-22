import React from "react";
import { useDispatch } from "react-redux";
import { signOut } from "../../model/AuthActions";

export function AuthSignOut() {
  const dispatch = useDispatch();

  return (
    <button
      aria-label="Log out"
      onClick={() => dispatch(signOut())}
      id="auth-signout"
    >
      LOG OUT
    </button>
  );
}
