import React, { useEffect } from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import { S3Image } from "aws-amplify-react";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  photoSection: {
    display: "flex",
    alignItems: "center",
  },
  photo: {
    maxWidth: "50vw",
  },
}));

function GalleryPhoto({ photo }) {
  const classes = useStyles();

  return (
    <div className={classes.photoSection}>
      <S3Image
        className={classes.photo}
        imgKey={photo.fullsize.key}
        style={{ display: "inline-block", paddingRight: "5px" }}
      />
      <div className={classes.photoDescription}>{photo.description}</div>
    </div>
  );
}

function PhotoGallery({ survey = null, surveys = null }) {
  const classes = useStyles();

  useEffect(() => {
    if (survey != null) {
      console.log("Reset selected photos");
      console.log(survey.photos);
    }
    if (surveys != null) {
      console.log("Reset selected photos");
      console.log(surveys.photos);
    }
  }, [survey, surveys]);

  if (surveys != null) {
    function surveyPhotos(survey) {
      const response = JSON.parse(survey.surveyResponse);

      return (
        <div className={classes.paper}>
          <h2>Images from {response.background.contactname.answer}</h2>
          {survey !== null ? (
            survey.photos.map((photo) => <GalleryPhoto photo={photo} />)
          ) : (
            <p>No photos</p>
          )}
        </div>
      );
    }

    return (
      <>
        {surveys
          .filter((survey) => survey.photos.length > 0)
          .map((survey) => surveyPhotos(survey))}
      </>
    );
  }

  return (
    <div className={classes.paper}>
      {survey !== null ? (
        survey.photos.map((photo) => <GalleryPhoto photo={photo} />)
      ) : (
        <p>No photos</p>
      )}
    </div>
  );
}

export default PhotoGallery;
