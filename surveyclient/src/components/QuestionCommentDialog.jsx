import React, { useState } from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes.js";
import Modal from "@material-ui/core/Modal";

export default function QuestionCommentDialog({
  sectionId,
  questionId,
  questionNumber,
  questionText,
  showComment,
  closeDialog,
}) {
  const dispatch = useDispatch();
  const questionAnswers = useSelector(
    (state) => state.answers[sectionId][questionId]
  );

  const [localComment, setLocalComment] = useState(questionAnswers.comments);

  const handleCommentChange = () => {
    console.log("handleCommentChange");
    dispatch({
      type: SET_ANSWER,
      sectionId: sectionId,
      questionId: questionId,
      field: "comments",
      value: localComment,
    });
    closeDialog();
  };

  return (
    <Modal
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
      <div className="add-note-dialog" aria-labelledby="form-dialog-title">
        <h2 className="title">Add Note</h2>
        <div className="question-line">
          <div className="question-number">{questionNumber}</div>
          <div className="question-text">{questionText}</div>
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