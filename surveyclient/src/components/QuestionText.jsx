import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes.js";

function QuestionText({
  sectionId,
  question,
  questionNumber,
  textField = false,
}) {
  const questionId = question.id;
  const id = sectionId + "-" + questionId;

  const dispatch = useDispatch();

  const questionAnswers = useSelector(
    (state) => state.answers[sectionId][questionId]
  );

  const handleChange = (event) => {
    dispatch({
      type: SET_ANSWER,
      sectionId: sectionId,
      questionId: questionId,
      field: "answer",
      value: event.target.value,
    });
  };

  if (textField) {
    return (
      <div id={id} className="question">
        <label htmlFor={id + "-text"}>{question.text}</label>
        <input
          id={id + "-text"}
          type="text"
          name={id + "-text"}
          onChange={handleChange}
          value={questionAnswers.answer}
        />
      </div>
    );
  }

  return (
    <div id={id} className="question">
      <div className="question-line">
        <div className="question-number">{questionNumber}</div>
        <div className="question-text">{question.text}</div>
      </div>
      <textarea onChange={handleChange} value={questionAnswers.answer} />
    </div>
  );
}

export default QuestionText;
