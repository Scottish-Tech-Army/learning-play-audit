import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes.js";
import TextField from "@material-ui/core/TextField";

function QuestionUserSelect({ sectionId, question, questionNumber }) {
  const questionId = question.id;
  const id = sectionId + "-" + questionId;

  const dispatch = useDispatch();

  const questionAnswers = useSelector(
    (state) => state.answers[sectionId][questionId]
  );

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

  function labelTitle() {
    switch (questionAnswers.answer) {
      case "a":
        return "Position";
      case "c":
        return "Year group";
      default:
        return "Details";
    }
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
      <span>I&nbsp;am&nbsp;a</span>
      <div className="toggle-button-group userrole">
        {toggleButton("a", "teacher")}
        {toggleButton("b", "parent")}
        {toggleButton("c", "pupil")}
        {toggleButton("d", "other")}
      </div>
      <TextField
        label={labelTitle()}
        value={questionAnswers.comments}
        onChange={handleCommentChange}
        variant="outlined"
      />
    </div>
  );
}

export default QuestionUserSelect;
