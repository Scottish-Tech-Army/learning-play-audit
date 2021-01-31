import React from "react";
import "../App.css";
import { DELETE_PHOTO, UPDATE_PHOTO_DESCRIPTION } from "../model/ActionTypes";
import { useDispatch, useSelector } from "react-redux";
import { deletePhotoSvg } from "./SvgUtils";

function GalleryPhoto({ photoId }) {
  const dispatch = useDispatch();
  const photo = useSelector((state) => state.photos[photoId]);
  const photoDetails = useSelector((state) => state.photoDetails[photoId]);

  const handleDescriptionChange = (photoId, event) => {
    dispatch({
      type: UPDATE_PHOTO_DESCRIPTION,
      photoId: photoId,
      description: event.target.value,
    });
  };

  const deletePhoto = () => {
    dispatch({ type: DELETE_PHOTO, photoId: photoId });
  };

  if (!photo || !photoDetails) {
    return <div className="photo-container">Photo not found</div>;
  }

  return (
    <div className="photo-container">
      <img
        className="photo"
        src={"data:image/jpeg;base64," + photo.imageData}
        alt={"survey view"}
      />
      <textarea
        className="photo-description"
        onChange={(e) => handleDescriptionChange(photoId, e)}
        value={photoDetails.description}
        placeholder="Add photo description"
      />
      <button
        aria-haspopup="true"
        aria-label="Delete Photo"
        onClick={deletePhoto}
        className="delete-button"
      >
        {deletePhotoSvg()}
      </button>
    </div>
  );
}

export default GalleryPhoto;
