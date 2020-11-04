import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes.js";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  question: {
    width: "100%",
    paddingTop: "0.5em",
    paddingBottom: "0.5em",
  },
  questionNumber: {
    position: "absolute",
  },
  questionText: {
    marginLeft: "2em",
  },
  answerRow: {
    display: "flex",
    flexDirection: "row",
  },
}));

function QuestionTextWithYear({ sectionId, question, questionNumber }) {
  const questionId = question.id;
  const id = sectionId + "-" + questionId;

  const dispatch = useDispatch();
  const classes = useStyles();

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
      <Box className={classes.answerRow}>
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
      </Box>
    );
  }

  return (
    <div id={id} className={classes.question}>
      <Box flexDirection="row">
        <div className={classes.questionNumber}>{questionNumber}</div>
        <p className={classes.questionText}>{question.text}</p>
      </Box>
      {yearAnswerRow("answer1", "year1")}
      {yearAnswerRow("answer2", "year2")}
      {yearAnswerRow("answer3", "year3")}
    </div>
  );
}

// <Box flexDirection="row">
//   <div className={classes.questionNumber}>{questionNumber}</div>
//   <p className={classes.questionText}>{question.text}</p>
// </Box>

export default QuestionTextWithYear;
