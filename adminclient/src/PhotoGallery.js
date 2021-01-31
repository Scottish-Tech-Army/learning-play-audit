import React, { useEffect, useState } from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import { getPhotoUrl } from "./model/SurveyModel";

const useStyles = makeStyles((theme) => ({
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
    display: "inline-block",
    paddingRight: "5px",
  },
}));

function GalleryPhoto({ photo }) {
  const classes = useStyles();

  // TODO default to downloading image ?
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    getPhotoUrl(photo.fullsize.key)
      .then((url) => setImgSrc(url))
      .catch((err) => console.log(err));
  }, [photo]);

  return (
    <div className={classes.photoSection}>
      {imgSrc && <img className={classes.photo} src={imgSrc} alt="" />}
      <div className={classes.photoDescription}>{photo.description}</div>
    </div>
  );
}

function PhotoGallery({ survey = null, surveys = null }) {
  const classes = useStyles();

  if (surveys != null) {
    function surveyPhotos(survey, index) {
      const response = survey.surveyResponse;

      return (
        <div key={"survey-" + index} className={classes.paper}>
          <h2>Images from {response.background.contactname.answer}</h2>
          {survey !== null ? (
            survey.photos.map((photo, j) => (
              <GalleryPhoto key={"photo-" + j} photo={photo} />
            ))
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
          .map((survey, i) => surveyPhotos(survey, i))}
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
