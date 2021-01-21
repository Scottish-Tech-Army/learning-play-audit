import React, { useState } from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { loadPhotos } from "../model/SurveyModel";
import GalleryPhoto from "./GalleryPhoto";
import { GALLERY } from "./FixedSectionTypes";
import SectionBottomNavigation from "./SectionBottomNavigation";
import { addPhotoSvg } from "./SvgUtils";
import { sectionsContent } from "learning-play-audit-shared";
import Modal from "@material-ui/core/Modal";

function GallerySection({ sections, setCurrentSection }) {
  const dispatch = useDispatch();
  const photoDetails = useSelector((state) => state.photoDetails);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const addPhoto = ({ target }) => {
    dispatch(loadPhotos(Array.from(target.files)));
    setShowConfirmDialog(true);
  };

  function isGeneralPhoto(photoDetails) {
    return (
      photoDetails.sectionId === null ||
      photoDetails.sectionId === undefined ||
      photoDetails.questionId === null ||
      photoDetails.questionId === undefined
    );
  }

  function getSectionQuestionPhotoIdMap() {
    const result = {};

    Object.keys(photoDetails)
      .filter((photoId) => !isGeneralPhoto(photoDetails[photoId]))
      .forEach((photoId, i) => {
        const current = photoDetails[photoId];

        let section = result[current.sectionId];
        if (section === undefined) {
          section = {};
          result[current.sectionId] = section;
        }
        let question = section[current.questionId];
        if (question === undefined) {
          question = [];
          section[current.questionId] = question;
        }
        question.push(photoId);
      });

    return result;
  }

  function orderedPhotos() {
    const output = [];

    const generalPhotoIds = Object.keys(photoDetails).filter((photoId) =>
      isGeneralPhoto(photoDetails[photoId])
    );
    if (generalPhotoIds.length > 0) {
      output.push(
        <div key="general" id="general" className="gallery-section-question">
          <h3>General</h3>
          {generalPhotoIds.map((photoId) => (
            <GalleryPhoto key={photoId} photoId={photoId} />
          ))}
        </div>
      );
    }

    const questionPhotoIds = getSectionQuestionPhotoIdMap();

    sectionsContent.forEach((section) => {
      const sectionId = section.id;
      const sectionTitle = section.title;

      const photoSection = questionPhotoIds[sectionId];
      if (photoSection === undefined) {
        return;
      }

      section.content((type, questionId, text) => {
        const photoQuestion = photoSection[questionId];
        if (photoQuestion === undefined) {
          return;
        }

        output.push(
          <div
            key={sectionId + "-" + questionId}
            id={sectionId + "-" + questionId}
            className="gallery-section-question"
          >
            <h3>
              {sectionTitle} - {text}
            </h3>
            {photoQuestion.map((photoId) => (
              <GalleryPhoto key={photoId} photoId={photoId} />
            ))}
          </div>
        );
      });
    });

    return output;
  }

  return (
    <div className="section gallery">
      <div className="section-header">
        <h1 className="title">Photos</h1>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="icon-button-add-photo"
          type="file"
          multiple="true"
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
      {orderedPhotos()}
      <SectionBottomNavigation
        sections={sections}
        currentSectionId={GALLERY}
        setCurrentSectionId={setCurrentSection}
      />
      {showConfirmDialog && (
        <Modal
          id="confirm-dialog-container"
          container={
            window !== undefined ? () => window.document.body : undefined
          }
          keepMounted={false}
          open={true}
          onClose={() => setShowConfirmDialog(false)}
        >
          <div className="dialog confirm-add-photos">
            <p>Photo(s) added</p>
            <div className="action-row">
              <button
                id="ok-button"
                onClick={() => setShowConfirmDialog(false)}
                aria-label="OK"
              >
                OK
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default GallerySection;
