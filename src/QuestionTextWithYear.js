import React from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "./ActionTypes.js";
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

function QuestionTextWithYear({
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

  const handleChange = (event, field) => {
    dispatch({
      type: SET_ANSWER,
      sectionId: sectionId,
      questionId: questionId,
      field: field,
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
      <Box className={classes.answerRow}>
        <TextField
          id="outlined-multiline-flexible"
          multiline
          fullWidth
          rowsMax={4}
          label="Improvement"
          value={questionAnswers.answer1}
          onChange={(event) => handleChange(event, "answer1")}
          variant="outlined"
        />
        <TextField
          id="outlined-multiline-flexible"
          fullWidth
          label="Year"
          value={questionAnswers.year1}
          onChange={(event) => handleChange(event, "year1")}
          variant="outlined"
        />
      </Box>
      <Box className={classes.answerRow}>
        <TextField
          id="outlined-multiline-flexible"
          multiline
          fullWidth
          rowsMax={4}
          label="Improvement"
          value={questionAnswers.answer2}
          onChange={(event) => handleChange(event, "answer2")}
          variant="outlined"
        />
        <TextField
          id="outlined-multiline-flexible"
          fullWidth
          label="Year"
          value={questionAnswers.year2}
          onChange={(event) => handleChange(event, "year2")}
          variant="outlined"
        />
      </Box>
      <Box className={classes.answerRow}>
        <TextField
          id="outlined-multiline-flexible"
          multiline
          fullWidth
          rowsMax={4}
          label="Improvement"
          value={questionAnswers.answer3}
          onChange={(event) => handleChange(event, "answer3")}
          variant="outlined"
        />
        <TextField
          id="outlined-multiline-flexible"
          fullWidth
          label="Year"
          value={questionAnswers.year3}
          onChange={(event) => handleChange(event, "year3")}
          variant="outlined"
        />
      </Box>
    </div>
  );
}

// <Box flexDirection="row">
//   <div className={classes.questionNumber}>{questionNumber}</div>
//   <p className={classes.questionText}>{question.text}</p>
// </Box>

export default QuestionTextWithYear;
