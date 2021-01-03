import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { loadPhoto } from "../model/SurveyModel";
import GalleryPhoto from "./GalleryPhoto";
import { GALLERY } from "./FixedSectionTypes";
import SectionBottomNavigation from "./SectionBottomNavigation";
import { addPhotoSvg } from "./SvgUtils";
import { sectionsContent } from "learning-play-audit-shared";

function GallerySection({ sections, setCurrentSection }) {
  const dispatch = useDispatch();
  const photoDetails = useSelector((state) => state.photoDetails);

  const addPhoto = ({ target }) => {
    dispatch(loadPhoto(target.files[0]));
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
          onChange={addPhoto}
        />
        <label htmlFor="icon-button-add-photo">{addPhotoSvg()}</label>
      </div>
      {orderedPhotos()}
      <SectionBottomNavigation
        sections={sections}
        currentSectionId={GALLERY}
        setCurrentSectionId={setCurrentSection}
      />
    </div>
  );
}

export default GallerySection;
