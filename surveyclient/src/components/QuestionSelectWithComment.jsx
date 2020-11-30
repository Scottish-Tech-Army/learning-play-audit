import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes.js";
import TextField from "@material-ui/core/TextField";

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

  const [showComment, setShowComment] = React.useState(hasComment());

  const handleClick = (newValue) => {
    dispatch({
      type: SET_ANSWER,
      sectionId: sectionId,
      questionId: questionId,
      field: "answer",
      value: newValue,
    });
  };
  const handleCommentChange = (event) => {
    dispatch({
      type: SET_ANSWER,
      sectionId: sectionId,
      questionId: questionId,
      field: "comments",
      value: event.target.value,
    });
  };
  const handleCommentButtonClick = (event) => {
    setShowComment((current) => !current || hasComment());
  };
  const handlePhotoButtonClick = (event) => {
    setShowComment((current) => !current || hasComment());
  };

  function addPhotoButton(count = 0) {
    return (
      <button
        className="add-photo-button"
        aria-label="add note"
        onClick={handlePhotoButtonClick}
      >
        <svg width="42px" height="45px" viewBox="0 0 42 45">
          <title>add photo</title>
          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g transform="translate(0, 10)" fill="#000000">
              <path
                d="M30,3.91 L25,3.91 L25,2 C25,0.8954305 24.1045695,0 23,0 L9,0 C7.8954305,0 7,0.8954305 7,2 L7,3.91 L2,3.91 C0.8954305,3.91 0,4.8054305 0,5.91 L0,22.91 C0,24.0145695 0.8954305,24.91 2,24.91 L30,24.91 C31.1045695,24.91 32,24.0145695 32,22.91 L32,5.91 C32,4.8054305 31.1045695,3.91 30,3.91 Z M16,21.91 C11.8578644,21.91 8.5,18.5521356 8.5,14.41 C8.5,10.2678644 11.8578644,6.91 16,6.91 C20.1421356,6.91 23.5,10.2678644 23.5,14.41 C23.5,16.3991237 22.7098237,18.306778 21.3033009,19.7133009 C19.896778,21.1198237 17.9891237,21.91 16,21.91 L16,21.91 Z"
                id="Shape"
              ></path>
              <circle cx="16" cy="14.41" r="5"></circle>
            </g>
            {count > 0 && (
              <g transform="translate(32, 10)">
                <circle r="10" fill="#39B54A"></circle>
                <text
                  dominantBaseline="middle"
                  textAnchor="middle"
                  stroke="#fff"
                  fill="#fff"
                  fontSize="12"
                >
                  {count}
                </text>
              </g>
            )}
          </g>
        </svg>
      </button>
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
      <div className="actionRow">
        <div className="toggle-button-group" aria-label={questionId}>
          {toggleButton("a", "strongly agree")}
          {toggleButton("b", "tend to agree")}
          {toggleButton("c", "tend to disagree")}
          {toggleButton("d", "strongly disagree")}
        </div>
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
        {addPhotoButton(4)}
      </div>
      <div className={showComment ? "commentbox" : "commentboxHidden"}>
        <TextField
          label="Comments / Notes"
          multiline
          fullWidth
          rowsMax={4}
          value={questionAnswers.comments}
          onChange={handleCommentChange}
          variant="outlined"
        />{" "}
      </div>
    </div>
  );
}

export default QuestionSelectWithComment;
