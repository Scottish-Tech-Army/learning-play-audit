import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes.js";

function QuestionUserSelect({ sectionId, question, }) {
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
        id={value}
        className={questionAnswers.answer === value ? "selected" : ""}
        onClick={() =>
          handleClick(questionAnswers.answer === value ? "" : value)
        }
        aria-label={label}
      >
        {label}
      </button>
    );
  }

  return (
    <div id={id} className="question user-select">
      <div className="selection-column">
        <span>I&nbsp;am&nbsp;a</span>
        <div className="toggle-button-group">
          {toggleButton("a", "teacher")}
          {toggleButton("b", "parent")}
          {toggleButton("c", "pupil")}
          {toggleButton("d", "other")}
        </div>{" "}
      </div>
      <div className="details-column">
        <label htmlFor={id + "-text"}>{labelTitle()}</label>
        <input
          id={id + "-text"}
          type="text"
          name={id + "-text"}
          onChange={handleCommentChange}
          value={questionAnswers.comments}
        />
      </div>
    </div>
  );
}

export default QuestionUserSelect;
