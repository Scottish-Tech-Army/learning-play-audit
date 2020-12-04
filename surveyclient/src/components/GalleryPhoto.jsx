import React from "react";
import "../App.css";
import { DELETE_PHOTO, UPDATE_PHOTO_DESCRIPTION } from "../model/ActionTypes";
import { useDispatch, useSelector } from "react-redux";
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
    <div className="photo-section">
      <IconButton
        className="delete-button"
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
      <textarea onChange={(e) => handleDescriptionChange(photoId, e)}>{description}</textarea>
    </div>
  );
}

export default GalleryPhoto;
