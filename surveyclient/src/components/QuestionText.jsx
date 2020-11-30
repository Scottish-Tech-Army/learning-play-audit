import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes.js";
import TextField from "@material-ui/core/TextField";

function QuestionText({
  sectionId,
  question,
  questionNumber,
  inlineLabel = false,
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

  if (inlineLabel) {
    return (
      <div id={id} className="question">
        <TextField
          multiline
          fullWidth
          rowsMax={4}
          label={question.text}
          value={questionAnswers.answer}
          onChange={handleChange}
          variant="outlined"
        />
      </div>
    );
  }

  return (
    <div id={id} className="question">
      <div className="question-line">
        <div className="questionNumber">{questionNumber}</div>
        <p className="questionText">{question.text}</p>
      </div>
      <TextField
        multiline
        fullWidth
        rowsMax={4}
        value={questionAnswers.answer}
        onChange={handleChange}
        variant="outlined"
      />
    </div>
  );
}

export default QuestionText;
