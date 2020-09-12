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
}));

function QuestionText({
  sectionId,
  question,
  questionNumber,
  inlineLabel = false,
}) {
  const questionId = question.id;

  const dispatch = useDispatch();
  const classes = useStyles();

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
      <div className={classes.question}>
        <TextField
          id="outlined-multiline-flexible"
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
    <div className={classes.question}>
      <Box flexDirection="row">
        <div className={classes.questionNumber}>{questionNumber}</div>
        <p className={classes.questionText}>{question.text}</p>
      </Box>
        <TextField
          id="outlined-multiline-flexible"
          multiline
          fullWidth
          rowsMax={4}
          value={questionAnswers.answer}
          onChange={handleChange}
          variant="outlined"
        />{" "}
    </div>
  );

}

// <Box flexDirection="row">
//   <div className={classes.questionNumber}>{questionNumber}</div>
//   <p className={classes.questionText}>{question.text}</p>
// </Box>

export default QuestionText;