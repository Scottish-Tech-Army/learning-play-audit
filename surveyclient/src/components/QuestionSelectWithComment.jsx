import React, { useState } from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes.js";
import Modal from "@material-ui/core/Modal";
import { addPhotoSvg } from "./SvgUtils";
import { loadPhoto } from "../model/SurveyModel";

function QuestionSelectWithComment({ sectionId, question, questionNumber }) {
  const questionId = question.id;
  const id = sectionId + "-" + questionId;

  const dispatch = useDispatch();

  const questionAnswers = useSelector(
    (state) => state.answers[sectionId][questionId]
  );

  function hasComment() {
    return (
      questionAnswers.comments !== null && questionAnswers.comments.length > 0
    );
  }

  const [showComment, setShowComment] = React.useState(false);
  const [localComment, setLocalComment] = useState(questionAnswers.comments);

  const handleClick = (newValue) => {
    dispatch({
      type: SET_ANSWER,
      sectionId: sectionId,
      questionId: questionId,
      field: "answer",
      value: questionAnswers.answer === newValue ? null : newValue,
    });
  };

  const handleCommentChange = () => {
    console.log("handleCommentChange");
    dispatch({
      type: SET_ANSWER,
      sectionId: sectionId,
      questionId: questionId,
      field: "comments",
      value: localComment,
    });
    setShowComment(false);
  };
  const handleCommentButtonClick = (event) => {
    setLocalComment(questionAnswers.comments);
    setShowComment(true);
  };
  const handlePhotoButtonClick = ({ target }) => {
    dispatch(loadPhoto(target.files[0], sectionId, questionId));
  };

  function addNoteButton() {
    return (
      <button
        className="add-note-button"
        aria-label="add note"
        onClick={handleCommentButtonClick}
      >
        <img
          src={
            hasComment()
              ? "/assets/add_note_ticked.svg"
              : "/assets/add_note.svg"
          }
          alt="add note"
        />
      </button>
    );
  }

  function addPhotoButton(count) {
    return (
      <>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="icon-button-add-photo"
          type="file"
          onChange={handlePhotoButtonClick}
        />
        <label
          htmlFor="icon-button-add-photo"
          className="add-photo-button"
          aria-label="add photo"
        >
          {addPhotoSvg(count)}
        </label>
      </>
    );
  }

  function toggleButton(value, label) {
    return (
      <button
        className={questionAnswers.answer === value ? "selected" : ""}
        onClick={() => handleClick(value)}
        aria-label={label}
      >
        {label}
      </button>
    );
  }

  return (
    <div id={id} className="question">
      <div className="question-line">
        <div className="question-number">{questionNumber}</div>
        <div className="question-text">{question.text}</div>
      </div>
      <div className="action-row">
        <div className="toggle-button-group" aria-label={questionId}>
          {toggleButton("a", "strongly agree")}
          {toggleButton("b", "tend to agree")}
          {toggleButton("c", "tend to disagree")}
          {toggleButton("d", "strongly disagree")}
        </div>
        <div className="action-button-group">
          {addNoteButton()}
          {addPhotoButton(4)}
        </div>
      </div>

      <Modal
        container={
          window !== undefined ? () => window.document.body : undefined
        }
        keepMounted={true}
        open={showComment}
        onClose={() => setShowComment(false)}
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
            <div className="question-text">{question.text}</div>
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
    </div>
  );
}

export default QuestionSelectWithComment;
