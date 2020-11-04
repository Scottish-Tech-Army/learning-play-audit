import React from "react";
import "../App.css";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes.js";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  question: {
    width: "100%",
    paddingTop: "1em",
    paddingBottom: "1em",
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  toggleOptions: {
    marginLeft: "20px",
    marginRight: "20px",
  },
}));

function QuestionUserSelect({ sectionId, question, questionNumber }) {
  const questionId = question.id;
  const id = sectionId + "-" + questionId;

  const dispatch = useDispatch();
  const classes = useStyles();

  const questionAnswers = useSelector(
    (state) => state.answers[sectionId][questionId]
  );

  const handleChange = (event, newValue) => {
    console.log(newValue);
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

  return (
    <div id={id} className={classes.question}>
      <span>I&nbsp;am&nbsp;a</span>
      <ToggleButtonGroup
        className={classes.toggleOptions}
        value={questionAnswers.answer}
        exclusive
        onChange={handleChange}
        aria-label={questionId}
      >
        <ToggleButton value="a" aria-label="teacher">
          teacher
        </ToggleButton>
        <ToggleButton value="b" aria-label="parent">
          parent
        </ToggleButton>
        <ToggleButton value="c" aria-label="pupil">
          pupil
        </ToggleButton>
        <ToggleButton value="d" aria-label="other">
          other
        </ToggleButton>
      </ToggleButtonGroup>
      <TextField
        label={labelTitle()}
        value={questionAnswers.comments}
        onChange={handleCommentChange}
        variant="outlined"
      />
    </div>
  );
}

export default QuestionUserSelect;
