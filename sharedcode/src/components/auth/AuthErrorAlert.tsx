import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError } from "../../model/AuthActions";
import { getAuthError } from "../../model/AuthStore";

export default function AuthErrorAlert() {
  const dispatch = useDispatch();

  const errorMessage = useSelector(getAuthError);

  return (
    <Snackbar open={errorMessage !== ""}>
      <Alert
        className="auth-alert"
        onClose={() => dispatch(clearAuthError())}
        severity="error"
      >
        {errorMessage}
      </Alert>
    </Snackbar>
  );
}
