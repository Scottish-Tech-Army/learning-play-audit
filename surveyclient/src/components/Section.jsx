import React, { useState, useEffect } from "react";
import "../App.css";
import Box from "@material-ui/core/Box";
import QuestionSelectWithComment from "./QuestionSelectWithComment";
import QuestionText from "./QuestionText";
import QuestionTextWithYear from "./QuestionTextWithYear";
import QuestionUserSelect from "./QuestionUserSelect";
import CommentIcon from "@material-ui/icons/Comment";
import Badge from "@material-ui/core/Badge";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tooltip from "@material-ui/core/Tooltip";
import {
  SCALE_WITH_COMMENT,
  TEXT,
  TEXT_WITH_YEAR,
  TEXT_INLINE_LABEL,
  USER_TYPE_WITH_COMMENT,
} from "../model/QuestionTypes";

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
  sectionContent: {
    width: "100%",
  },
  countBadge: {
    marginRight: "15px",
  },
}));

function Section({ section, expanded, handleAccordionChange }) {
  const classes = useStyles();

  const sectionId = section.id;

  const answerCounts = useSelector((state) => state.answerCounts[sectionId]);

  const sectionContent = () => {
    var questionIndex = 0;
    function addQuestion(type, id, text) {
      questionIndex += 1;

      if (SCALE_WITH_COMMENT === type) {
        return (
          <QuestionSelectWithComment
            key={sectionId + "-" + id}
            sectionId={sectionId}
            question={{ id: id, text: text }}
            questionNumber={questionIndex}
          />
        );
      }

      if (USER_TYPE_WITH_COMMENT === type) {
        return (
          <QuestionUserSelect
            key={sectionId + "-" + id}
            sectionId={sectionId}
            question={{ id: id, text: text }}
            questionNumber={questionIndex}
          />
        );
      }

      if (TEXT === type || TEXT_INLINE_LABEL === type) {
        return (
          <QuestionText
            key={sectionId + "-" + id}
            sectionId={sectionId}
            question={{ id: id, text: text }}
            questionNumber={questionIndex}
            inlineLabel={TEXT_INLINE_LABEL === type}
          />
        );
      }

      if (TEXT_WITH_YEAR === type) {
        return (
          <QuestionTextWithYear
            key={sectionId + "-" + id}
            sectionId={sectionId}
            question={{ id: id, text: text }}
            questionNumber={questionIndex}
          />
        );
      }

      throw new Error("unknown question type: " + type);
    }

    console.log("Render section " + section.title);
    return (
      <Box className={classes.sectionContent} flexDirection="column">
        {section.content(addQuestion)}
      </Box>
    );
  };

  const [totalQuestions, setTotalQuestions] = useState(0);

  // Count total questions
  useEffect(() => {
    var questionCount = 0;
    section.content((type, id) => (questionCount += 1));
    setTotalQuestions(questionCount);
  }, [section]);

  function CircularProgressWithLabel(props) {
    return (
      <Box
        position="relative"
        display="inline-flex"
        className={classes.circularProgressWithLabel}
      >
        <CircularProgress variant="static" {...props} />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Tooltip title={props.tooltip} placement="top">
            <Typography variant="caption" component="div" color="textSecondary">
              {props.label}
            </Typography>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  const AccordionSummary = withStyles({
    root: {
      backgroundColor: "rgba(0, 0, 0, .05)",
    },
    content: {
      alignItems: "center",
    },
  })(MuiAccordionSummary);

  function sectionSummary() {
    const progress = (answerCounts.answer * 100) / totalQuestions;
    const answerProgressLabel = answerCounts.answer + "/" + totalQuestions;
    const remainingQuestions =
      totalQuestions - answerCounts.answer === 1
        ? "1 question remaining"
        : totalQuestions - answerCounts.answer + " questions remaining";
    const commentsTooltip =
      answerCounts.comments === 1
        ? "1 comment added"
        : answerCounts.comments + " comments added";

    return (
      <AccordionSummary
        className={classes.accordionSummary}
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

        <CircularProgressWithLabel
          value={progress}
          label={answerProgressLabel}
          tooltip={remainingQuestions}
        />

        <Tooltip title={commentsTooltip} placement="top">
          <Badge
            className="count-badge"
            badgeContent={answerCounts.comments}
            color="primary"
          >
            <CommentIcon />
          </Badge>
        </Tooltip>
      </AccordionSummary>
    );
  }

  return (
    <Accordion
      key={section.id}
      expanded={expanded === section.id}
      onChange={handleAccordionChange(section.id)}
    >
      {sectionSummary()}
      <AccordionDetails>
        {expanded === section.id && sectionContent()}
      </AccordionDetails>
    </Accordion>
  );
}

export default Section;
