import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import Modal from "@material-ui/core/Modal";
import { addPhotoSvg } from "./SvgUtils";
import { loadPhoto } from "../model/SurveyModel";
import GalleryPhoto from "./GalleryPhoto";

export default function QuestionPhotosDialog({
  sectionId,
  questionId,
  questionNumber,
  questionText,
  closeDialog,
}) {
  const dispatch = useDispatch();
  const photoDetails = useSelector((state) => state.photoDetails);

  const addPhoto = ({ target }) => {
    dispatch(loadPhoto(target.files[0], sectionId, questionId));
  };

  function questionPhotos() {
    return (
      photoDetails !== undefined &&
      Object.keys(photoDetails)
        .filter((photoId) => {
          const current = photoDetails[photoId];
          return (
            current.sectionId === sectionId && current.questionId === questionId
          );
        })
        .map((photoId, i) => <GalleryPhoto key={i} photoId={photoId} />)
    );
  }

  return (
    <Modal
      id="dialog-container"
      container={window !== undefined ? () => window.document.body : undefined}
      keepMounted={false}
      open={true}
      onClose={closeDialog}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="dialog add-photos">
        <h2 className="title">Add Photos</h2>
        <div className="question-line">
          <div className="question-number">{questionNumber}</div>
          <div className="question-text">{questionText}</div>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="icon-button-add-photo"
            type="file"
            onChange={addPhoto}
          />
          <label htmlFor="icon-button-add-photo">
            <span className="label-text">
              Select
              <br />
              photo
            </span>
            {addPhotoSvg()}
          </label>
        </div>
        <div className="add-photos-scroll">{questionPhotos()}</div>
        <button
          className="close-button"
          onClick={closeDialog}
          aria-label="Done"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
