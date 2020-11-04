import React from "react";
import "../App.css";
import { makeStyles } from "@material-ui/core/styles";
import { DELETE_PHOTO, UPDATE_PHOTO_DESCRIPTION } from "../model/ActionTypes";
import { useDispatch, useSelector } from "react-redux";
import TextField from "@material-ui/core/TextField";
import RemoveCircleOutlineOutlinedIcon from "@material-ui/icons/RemoveCircleOutlineOutlined";
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({
  photo: {
    maxWidth: "200px",
    width: "100%",
    margin: "5px",
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
    justifyContent: "stretch",
    flexWrap: "wrap",
    paddingTop: "10px",
    paddingBottom: "10px",
    borderTop: "grey 2px solid",
    alignItems: "start",
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
  photoDescription: {
    margin: "5px",
  },
  deleteButton: {
    margin: "5px",
  },
}));

function GalleryPhoto({ photoId }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const imageData = useSelector((state) =>
    state.photos[photoId] ? state.photos[photoId].imageData : ""
  );
  const description = useSelector(
    (state) => state.photoDetails[photoId].description
  );

  const handleDescriptionChange = (photoId, event) => {
    dispatch({
      type: UPDATE_PHOTO_DESCRIPTION,
      photoId: photoId,
      description: event.target.value,
    });
  };

  const deletePhoto = () => {
    dispatch({
      type: DELETE_PHOTO,
      photoId: photoId,
    });
  };

  return (
    <div className={classes.photoSection}>
      <IconButton
        className={classes.deleteButton}
        color="primary"
        aria-label="Delete Photo"
        component="span"
        onClick={deletePhoto}
      >
        <RemoveCircleOutlineOutlinedIcon fontSize="large" />
      </IconButton>
      <img
        className={classes.photo}
        src={"data:image/jpeg;base64," + imageData}
        alt={"survey view"}
      />
      <TextField
        id="outlined-multiline-flexible"
        label="Description"
        multiline
        className={"photo-description " + classes.photoDescription}
        rowsMax={4}
        value={description}
        onChange={(e) => {
          handleDescriptionChange(photoId, e);
        }}
        variant="outlined"
      />
    </div>
  );
}

export default GalleryPhoto;
