import React from "react";
import "../App.css";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { loadPhoto } from "../model/SurveyModel";
import GalleryPhoto from "./GalleryPhoto";
import AddPhotoAlternateOutlinedIcon from "@material-ui/icons/AddPhotoAlternateOutlined";
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({
  gallerySection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  photo: {
    maxWidth: "200px",
    width: "100%",
  },
  question: {
    width: "100%",
    paddingTop: "1em",
    paddingBottom: "1em",
    borderTop: "1px solid grey",
  },
  photoSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
  },
  questionNumber: {
    position: "absolute",
  },
  questionText: {
    marginLeft: "2em",
  },
  commentboxHidden: {
    display: "none",
  },
  commentbox: {
    paddingTop: "1em",
  },
  label: {
    color: "rgba(0, 0, 0, 0.87)",
  },
}));

function GallerySection() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const photoDetails = useSelector((state) => state.photoDetails);

  const addPhoto = ({ target }) => {
    dispatch(loadPhoto(target.files[0]));
  };

  return (
    <Box className={classes.gallerySection}>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <h1>Photos</h1>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="icon-button-add-photo"
          type="file"
          onChange={addPhoto}
        />
        <label htmlFor="icon-button-add-photo">
          <IconButton color="primary" aria-label="Add Photo" component="span">
            <AddPhotoAlternateOutlinedIcon fontSize="large" />
          </IconButton>
        </label>
      </Box>

      {photoDetails !== undefined ? (
        Object.keys(photoDetails).map((photoId) => (
          <GalleryPhoto photoId={photoId} />
        ))
      ) : (
        <></>
      )}
    </Box>
  );
}

export default GallerySection;
