import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes";
import { getAnswers, QuestionAnswer } from "../model/SurveyModel";
import { Question } from "learning-play-audit-survey";

export interface QuestionUserSelectProps {
  sectionId: string;
  question: Question;
}

function QuestionUserSelect({ sectionId, question }: QuestionUserSelectProps) {
  const questionId = question.id;
  const id = sectionId + "-" + questionId;

  const dispatch = useDispatch();

  const questionAnswer = useSelector(getAnswers)[sectionId][
    questionId
  ] as QuestionAnswer;

  const handleClick = (value: string) => {
    dispatch({
      type: SET_ANSWER,
      sectionId,
      questionId,
      field: "answer",
      value,
    });
  };
  const handleCommentChange = (value: string) => {
    dispatch({
      type: SET_ANSWER,
      sectionId,
      questionId,
      field: "comments",
      value,
    });
  };

  function labelTitle() {
    switch (questionAnswer.answer) {
      case "a":
        return "Position";
      case "c":
        return "Year group";
      default:
        return "Details";
    }
  }

  function toggleButton(value: string, label: string) {
    return (
      <button
        id={value}
        className={questionAnswer.answer === value ? "selected" : ""}
        onClick={() =>
          handleClick(questionAnswer.answer === value ? "" : value)
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
          onChange={(event) => handleCommentChange(event.target.value)}
          value={questionAnswer.comments}
        />
      </div>
    </div>
  );
}

export default QuestionUserSelect;
