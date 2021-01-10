import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes.js";
import QuestionAddPhotosButton from "./QuestionAddPhotosButton";

function QuestionTextWithYear({ sectionId, question, questionNumber }) {
  const questionId = question.id;
  const id = sectionId + "-" + questionId;

  const dispatch = useDispatch();

  const questionAnswers = useSelector(
    (state) => state.answers[sectionId][questionId]
  );

  const handleChange = (event, field) => {
    dispatch({
      type: SET_ANSWER,
      sectionId: sectionId,
      questionId: questionId,
      field: field,
      value: event.target.value,
    });
  };

  function yearAnswerRow(answerKey, yearKey, answerLabel) {
    return (
      <div className="dated-improvement-answer">
        <div className="improvement">
          <label htmlFor={answerKey + "-text"}>{answerLabel}</label>
          <input
            id={answerKey + "-text"}
            type="text"
            name={answerKey + "-text"}
            onChange={(event) => handleChange(event, answerKey)}
            value={questionAnswers[answerKey]}
          />
        </div>
        <div className="year">
          <label htmlFor={yearKey + "-text"}>Year</label>
          <input
            id={yearKey + "-text"}
            type="text"
            name={yearKey + "-text"}
            onChange={(event) => handleChange(event, yearKey)}
            value={questionAnswers[yearKey]}
          />
        </div>
      </div>
    );
  }

  return (
    <div id={id} className="question dated">
      <div className="question-line">
        <div className="question-number">{questionNumber}</div>
        <div className="question-text">{question.text}</div>
        <QuestionAddPhotosButton
          sectionId={sectionId}
          questionId={questionId}
          questionNumber={questionNumber}
          questionText={question.text}
        />
      </div>
      {yearAnswerRow("answer1", "year1", "Improvement 1")}
      {yearAnswerRow("answer2", "year2", "Improvement 2")}
      {yearAnswerRow("answer3", "year3", "Improvement 3")}
    </div>
  );
}

export default QuestionTextWithYear;
