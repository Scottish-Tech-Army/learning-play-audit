import React from "react";
import "../App.css";
import { DELETE_PHOTO, UPDATE_PHOTO_DESCRIPTION } from "../model/ActionTypes";
import { useDispatch, useSelector } from "react-redux";
import TextField from "@material-ui/core/TextField";
import RemoveCircleOutlineOutlinedIcon from "@material-ui/icons/RemoveCircleOutlineOutlined";
import IconButton from "@material-ui/core/IconButton";


function GalleryPhoto({ photoId }) {
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
    <div className="photoSection">
      <IconButton
        className="deleteButton"
        color="primary"
        aria-label="Delete Photo"
        component="span"
        onClick={deletePhoto}
      >
        <RemoveCircleOutlineOutlinedIcon fontSize="large" />
      </IconButton>
      <img
        className="photo"
        src={"data:image/jpeg;base64," + imageData}
        alt={"survey view"}
      />
      <TextField
        id="outlined-multiline-flexible"
        label="Description"
        multiline
        className="photo-description"
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
