import React, { useEffect, useState } from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import {
  getPhotoUrl,
  PhotoDetails,
  QuestionAnswer,
  SurveyResponse,
} from "./model/SurveyModel";

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

interface GalleryPhotoProps {
  photo: PhotoDetails;
}

function GalleryPhoto({ photo }: GalleryPhotoProps) {
  const classes = useStyles();

  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    getPhotoUrl(photo.fullsize.key)
      .then((url) => setImgSrc(url))
      .catch((err) => console.log(err));
  }, [photo]);

  return (
    <div className={classes.photoSection}>
      {imgSrc && <img className={classes.photo} src={imgSrc} alt="" />}
      <div>{photo.description}</div>
    </div>
  );
}

interface PhotoGalleryProps {
  surveys: SurveyResponse[];
}

function PhotoGallery({ surveys }: PhotoGalleryProps) {
  const classes = useStyles();

  function surveyPhotos(survey: SurveyResponse, index: number) {
    const response = survey.surveyResponse;

    return (
      <div key={"survey-" + index} className={classes.paper}>
        <h2>
          Images from{" "}
          {(response.background.contactname as QuestionAnswer).answer}
        </h2>
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
      {surveys.filter((survey) => survey.photos.length > 0).map(surveyPhotos)}
    </>
  );
}

export default PhotoGallery;
