import React, { useEffect } from "react";
import "../App.css";
import { useSelector } from "react-redux";
import { addPhotoSvg } from "./SvgUtils";
import QuestionPhotosDialog from "./QuestionPhotosDialog";
import { getPhotoDetails } from "../model/SurveyModel";
import { Markup } from "learning-play-audit-survey";

export interface QuestionAddPhotosButtonProps {
  sectionId: string;
  questionId: string;
  questionNumber: number;
  questionText: Markup | Markup[];
}

export default function QuestionAddPhotosButton({
  sectionId,
  questionId,
  questionNumber,
  questionText,
}: QuestionAddPhotosButtonProps) {
  const [photoCount, setPhotoCount] = React.useState(0);
  const [showPhotos, setShowPhotos] = React.useState(false);

  const photoDetails = useSelector(getPhotoDetails);

  useEffect(() => {
    if (photoDetails === undefined) {
      setPhotoCount(0);
    } else {
      setPhotoCount(
        Object.keys(photoDetails).filter((photoId) => {
          const current = photoDetails[photoId];
          return (
            current.sectionId === sectionId && current.questionId === questionId
          );
        }).length
      );
    }
  }, [photoDetails, sectionId, questionId]);

  return (
    <>
      <button
        className="add-photos-button"
        aria-label="add photos"
        onClick={() => setShowPhotos(true)}
      >
        {addPhotoSvg(photoCount)}
        <span>Add Relevant Photo?</span>
      </button>
      {showPhotos && (
        <QuestionPhotosDialog
          sectionId={sectionId}
          questionId={questionId}
          questionNumber={questionNumber}
          questionText={questionText}
          closeDialog={() => setShowPhotos(false)}
        />
      )}
    </>
  );
}
