import React from "react";
import "../App.css";
import Box from "@material-ui/core/Box";
import { useSelector } from "react-redux";
import Button from "@material-ui/core/Button";
import { v4 as uuidv4 } from "uuid";
import { makeStyles } from "@material-ui/core/styles";
import { API } from "aws-amplify";

const useStyles = makeStyles((theme) => ({
  submitSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

function SubmitSection() {
  const state = useSelector((state) => state);
  const classes = useStyles();

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
    <Box className={classes.submitSection}>
      <Button className="submit-survey" variant="outlined" color="primary" onClick={uploadResults}>
        Upload...
      </Button>
    </Box>
  );
}

export default SubmitSection;
