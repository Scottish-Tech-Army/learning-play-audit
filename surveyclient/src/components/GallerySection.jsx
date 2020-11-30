import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { loadPhoto } from "../model/SurveyModel";
import GalleryPhoto from "./GalleryPhoto";
import AddPhotoAlternateOutlinedIcon from "@material-ui/icons/AddPhotoAlternateOutlined";
import IconButton from "@material-ui/core/IconButton";
import { GALLERY } from "./FixedSectionTypes";
import SectionBottomNavigation from "./SectionBottomNavigation";

function GallerySection({ sections, setCurrentSection }) {
  const dispatch = useDispatch();
  const photoDetails = useSelector((state) => state.photoDetails);

  const addPhoto = ({ target }) => {
    dispatch(loadPhoto(target.files[0]));
  };

  return (
    <div className="gallery-section">
      <div className="gallery-section-header">
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
      </div>

      {photoDetails !== undefined &&
        Object.keys(photoDetails).map((photoId) => (
          <GalleryPhoto photoId={photoId} />
        ))}
      <SectionBottomNavigation
        sections={sections}
        currentSectionId={GALLERY}
        setCurrentSectionId={setCurrentSection}
      />
    </div>
  );
}

export default GallerySection;
