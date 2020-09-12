import React from "react";
import "./App.css";
import Box from "@material-ui/core/Box";
import QuestionSelectWithComment from "./QuestionSelectWithComment";
import CommentIcon from "@material-ui/icons/Comment";
import Badge from "@material-ui/core/Badge";
import DoneIcon from "@material-ui/icons/Done";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";

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
  // root: {
  //   flexGrow: 1,
  // },
  // menuButton: {
  //   marginRight: theme.spacing(2),
  // },
  title: {
    flexGrow: 1,
  },
}));

function SectionSummary({ section, expanded, handleAccordionChange }) {
  const classes = useStyles();
  const totalQuestions = section.questions.length;

  const sectionId = section.id;

  const sectionAnswers = useSelector((state) => state.answers[sectionId]);

  console.log("sectionAnswers");
  console.log(sectionAnswers);
  function hasComment(answer) {
    return answer.comments !== null && answer.comments.length > 0;
  }

  function hasAnswer(answer) {
    return answer.answer !== null && answer.answer.length > 0;
  }

  function commentCount() {
    console.log(Object.values(sectionAnswers));
    return Object.values(sectionAnswers).reduce(
      (acc, answer) => acc + (hasComment(answer) ? 1 : 0),
      0
    );
  }

  function answerCount() {
    return Object.values(sectionAnswers).reduce(
      (acc, answer) => acc + (hasAnswer(answer) ? 1 : 0),
      0
    );
  }


  return (
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={section.id + "-content"}
        id={section.id + "-header"}
      >
        <Typography className={classes.heading}>
          Section {section.number}
        </Typography>
        <Typography className={classes.secondaryHeading}>
          {section.title}
        </Typography>
        <Badge
          className="count-badge"
          badgeContent={answerCount() + "/" + totalQuestions}
          color="primary"
        >
          <DoneIcon />
        </Badge>
        <Badge
          className="count-badge"
          badgeContent={commentCount()}
          color="primary"
        >
          <CommentIcon />
        </Badge>
      </AccordionSummary>
  );
}

export default SectionSummary;
