import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes.js";
import TextField from "@material-ui/core/TextField";

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

  function yearAnswerRow(answerKey, yearKey) {
    return (
      <div className="answerRow">
        <TextField
          className="text-improvement"
          multiline
          fullWidth
          rowsMax={4}
          label="Improvement"
          value={questionAnswers[answerKey]}
          onChange={(event) => handleChange(event, answerKey)}
          variant="outlined"
        />
        <TextField
          className="text-year"
          fullWidth
          label="Year"
          value={questionAnswers[yearKey]}
          onChange={(event) => handleChange(event, yearKey)}
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
      {yearAnswerRow("answer1", "year1")}
      {yearAnswerRow("answer2", "year2")}
      {yearAnswerRow("answer3", "year3")}
    </div>
  );
}

// <Box flexDirection="row">
//   <div className=questionNumber}>{questionNumber}</div>
//   <p className=questionText}>{question.text}</p>
// </Box>

export default QuestionTextWithYear;
