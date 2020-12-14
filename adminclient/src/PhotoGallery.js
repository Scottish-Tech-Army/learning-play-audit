import React, { useEffect, useState } from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { formatUrl } from "@aws-sdk/util-format-url";
import { createRequest } from "@aws-sdk/util-create-request";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { Auth } from "@aws-amplify/auth";

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

// Configure these properties in .env.local
const REGION = process.env.REACT_APP_AWS_REGION;
const SURVEY_RESOURCES_S3_BUCKET =
  process.env.REACT_APP_AWS_SURVEY_RESOURCES_S3_BUCKET;

function GalleryPhoto({ photo }) {
  const classes = useStyles();

  // TODO default to downloading image ?
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    async function getS3Url() {
      const credentials = await Auth.currentCredentials();

      const s3 = new S3Client({ region: REGION, credentials });

      const params = {
        Bucket: SURVEY_RESOURCES_S3_BUCKET,
        Key: photo.fullsize.key,
      };

      const signer = new S3RequestPresigner({ ...s3.config });
      const request = await createRequest(s3, new GetObjectCommand(params));
      return Promise.resolve(
        formatUrl(await signer.presign(request, { expiresIn: 900 }))
      );
    }

    getS3Url()
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
