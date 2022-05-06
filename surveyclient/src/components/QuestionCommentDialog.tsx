import React, { useState } from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes";
import Modal from "@material-ui/core/Modal";
import { renderMarkup } from "./RenderMarkup";
import { getAnswers, QuestionAnswer } from "../model/SurveyModel";
import { Markup } from "learning-play-audit-survey";

export type QuestionCommentDialogProps = {
  sectionId: string;
  questionId: string;
  questionNumber: number;
  questionText: Markup | Markup[];
  closeDialog: () => void;
};

export default function QuestionCommentDialog({
  sectionId,
  questionId,
  questionNumber,
  questionText,
  closeDialog,
}: QuestionCommentDialogProps) {
  const dispatch = useDispatch();
  const questionAnswer = useSelector(getAnswers)[sectionId][
    questionId
  ] as QuestionAnswer;

  const [localComment, setLocalComment] = useState(questionAnswer.comments);

  const handleCommentChange = () => {
    console.debug("handleCommentChange");
    dispatch({
      type: SET_ANSWER,
      sectionId,
      questionId,
      field: "comments",
      value: localComment,
    });
    closeDialog();
  };

  return (
    <Modal
      id="dialog-container"
      container={window !== undefined ? () => window.document.body : undefined}
      keepMounted={false}
      open={true}
      onClose={closeDialog}
    >
      <div className="dialog add-note">
        <h2 className="title">Add Note</h2>
        <div className="question-line">
          <div className="question-number">{questionNumber}</div>
          <div className="question-text">{renderMarkup(questionText)}</div>
        </div>
        <textarea
          onChange={(event) =>
            event.target.value !== localComment &&
            setLocalComment(event.target.value)
          }
          placeholder="Add text here…"
          value={localComment}
        />
        <button
          className="save-note-button"
          onClick={() => handleCommentChange()}
          aria-label="Add To Survey"
        >
          Add To Survey
        </button>
      </div>
    </Modal>
  );
}
