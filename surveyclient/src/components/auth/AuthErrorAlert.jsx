import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError } from "./utils";

export default function AuthErrorAlert() {
  const dispatch = useDispatch();

  const errorMessage = useSelector(
    (state) => state.authentication.errorMessage
  );

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    dispatch(clearAuthError());
  };

  return (
    <Snackbar open={errorMessage !== ""}>
      <Alert onClose={handleClose} severity="error">
        {errorMessage}
      </Alert>
    </Snackbar>
  );
}
