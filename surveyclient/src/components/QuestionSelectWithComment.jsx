import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes";
import QuestionAddCommentButton from "./QuestionAddCommentButton";
import QuestionAddPhotosButton from "./QuestionAddPhotosButton";

export default function QuestionSelectWithComment({
  sectionId,
  question,
  questionNumber,
}) {
  const questionId = question.id;
  const id = sectionId + "-" + questionId;

  const dispatch = useDispatch();
  const questionAnswers = useSelector(
    (state) => state.answers[sectionId][questionId]
  );

  function handleClick(newValue) {
    dispatch({
      type: SET_ANSWER,
      sectionId: sectionId,
      questionId: questionId,
      field: "answer",
      value: questionAnswers.answer === newValue ? "" : newValue,
    });
  }

  function toggleButton(value, label) {
    return (
      <button
        id={value}
        className={questionAnswers.answer === value ? "selected" : ""}
        onClick={() => handleClick(value)}
        aria-label={label}
      >
        {label}
      </button>
    );
  }

  return (
    <div id={id} className="question select">
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
          <QuestionAddCommentButton
            sectionId={sectionId}
            questionId={questionId}
            questionNumber={questionNumber}
            questionText={question.text}
          />
          <QuestionAddPhotosButton
            sectionId={sectionId}
            questionId={questionId}
            questionNumber={questionNumber}
            questionText={question.text}
          />
        </div>
      </div>
    </div>
  );
}
