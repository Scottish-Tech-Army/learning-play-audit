import React from "react";
import "../App.css";
import { DELETE_PHOTO, UPDATE_PHOTO_DESCRIPTION } from "../model/ActionTypes";
import { useDispatch, useSelector } from "react-redux";
import { deletePhotoSvg } from "./SvgUtils";

function GalleryPhoto({ photoId }) {
  const dispatch = useDispatch();
  const imageData = useSelector((state) =>
    state.photos[photoId] ? state.photos[photoId].imageData : ""
  );
  const photoDetails = useSelector((state) => state.photoDetails[photoId]);
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
      <img
        className="photo"
        src={"data:image/jpeg;base64," + imageData}
        alt={"survey view"}
      />
      <div className="photo-details">
        <div className="question-id">
          {photoDetails.sectionId} {photoDetails.questionId}
        </div>
        <textarea
          onChange={(e) => handleDescriptionChange(photoId, e)}
          value={description}
        />
      </div>
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
