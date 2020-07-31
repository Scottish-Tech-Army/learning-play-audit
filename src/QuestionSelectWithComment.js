import React from "react";
import "./App.css";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import CommentIcon from "@material-ui/icons/Comment";
import CommentOutlinedIcon from "@material-ui/icons/CommentOutlined";
import IconButton from "@material-ui/core/IconButton";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "./ActionTypes.js";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import { makeStyles, withStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
    flexGrow: 1,
    textAlign: "start",
  },
  title: {
    flexGrow: 1,
  },
  circularProgressWithLabel: {
    marginRight: "10px",
  },
  actionRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  questionNumber: {
    position: "absolute",
  },
  questionText: {
    marginLeft: "2em",
  },
}));

function QuestionSelectWithComment({ sectionId, question, index }) {
  const questionId = question.id;

  const dispatch = useDispatch();
  const classes = useStyles();

  const questionAnswers = useSelector(
    (state) => state.answers[sectionId][questionId]
  );

  function hasComment() {
    return (
      questionAnswers.comments !== null && questionAnswers.comments.length > 0
    );
  }

  const [showComment, setShowComment] = React.useState(hasComment());

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
  const handleCommentButtonClick = (event) => {
    setShowComment((current) => !current || hasComment());
  };

  return (
    <div className="question">
      <Box flexDirection="row">
        <div className={classes.questionNumber}>{index + 1}</div>
        <p className={classes.questionText}>{question.text}</p>
      </Box>
      <Box className={classes.actionRow}>
        <ToggleButtonGroup
          value={questionAnswers.answer}
          exclusive
          onChange={handleChange}
          aria-label={questionId}
        >
          <ToggleButton value="a" aria-label="strongly agree">
            strongly agree
          </ToggleButton>
          <ToggleButton value="b" aria-label="tend to agree">
            tend to agree
          </ToggleButton>
          <ToggleButton value="c" aria-label="tend to disagree">
            tend to disagree
          </ToggleButton>
          <ToggleButton value="d" aria-label="strongly disagree">
            strongly disagree
          </ToggleButton>
        </ToggleButtonGroup>
        <IconButton
          aria-label="show comment"
          onClick={handleCommentButtonClick}
        >
          {hasComment() ? (
            <CommentIcon fontSize="inherit" />
          ) : (
            <CommentOutlinedIcon fontSize="inherit" />
          )}
        </IconButton>
      </Box>
      <div className={showComment ? "commentbox" : "commentbox-hidden"}>
        <TextField
          id="outlined-multiline-flexible"
          label="Comments / Notes"
          multiline
          fullWidth
          rowsMax={4}
          value={questionAnswers.comments}
          onChange={handleCommentChange}
          variant="outlined"
        />{" "}
      </div>
    </div>
  );
}

export default QuestionSelectWithComment;
