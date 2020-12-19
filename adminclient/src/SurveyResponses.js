import React from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import {
  SCALE_WITH_COMMENT,
  TEXT,
  TEXT_INLINE_LABEL,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
} from "./QuestionTypes";
import Box from "@material-ui/core/Box";
import { sectionsContent } from "./Content";

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
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    // position: "absolute",
    // width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  photo: {
    height: "50px",
  },
  answer: {
    color: "green",
  },
  comment: {
    color: "red",
  },
  responsesGrid: {
    border: "#d3d3d3 thin solid",
    margin: "5px",
    borderCollapse: "collapse",
    width: "90%",
    tableLayout: "fixed",
    "& td": {
      border: "#d3d3d3 thin solid",
      padding: "5px",
      height: "15px",
    },
    "& td.response-no": {
      width: "1em",
      textAlign: "center",
    },
    "& td.scale-value": {
      width: "8em",
    },
    "& td.user-type": {
      width: "5em",
    },
    "& td.year": {
      width: "3em",
      textAlign: "center",
    },
  },
  questionText: {
    paddingBottom: "5px",
  },
  question: {
    paddingBottom: "15px",
  },
}));

function hasValue(response) {
  return response !== null && response.length > 0;
}

function getValue(response) {
  return response !== null ? response : "";
}

function getResponseNumberCell(responses, responseNumber) {
  return responses.length > 1 ? (
    <td className="response-no">{responseNumber}</td>
  ) : (
    <></>
  );
}

function QuestionSelectWithComment({ question, questionNumber, responses }) {
  const classes = useStyles();

  function hasComment(response) {
    return response.comments !== null && response.comments.length > 0;
  }

  function getAnswer(response) {
    switch (response.answer) {
      case null:
      case "":
        return "";
      case "a":
        return "strongly agree";
      case "b":
        return "tend to agree";
      case "c":
        return "tend to disagree";
      case "d":
        return "strongly disagree";
      default:
        return "unknown: " + response.answer;
    }
  }

  return (
    <div className={classes.question}>
      <Box flexDirection="row">
        <div className={classes.questionText}>
          {questionNumber}: {question.text}
        </div>
      </Box>
      <table className={classes.responsesGrid}>
        <tbody>
          {responses.map((response, i) => {
            return (
              <tr key={"" + i}>
                {getResponseNumberCell(responses, i + 1)}
                <td className="scale-value">{getAnswer(response)}</td>
                <td>{hasComment(response) ? response.comments : <></>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QuestionUserSelect({ question, questionNumber, responses }) {
  const classes = useStyles();

  function getAnswer(response) {
    switch (response.answer) {
      case null:
      case "":
        return "";
      case "a":
        return "teacher";
      case "b":
        return "parent";
      case "c":
        return "pupil";
      case "d":
        return "other";
      default:
        return "unknown: " + response.answer;
    }
  }

  function labelTitle(response) {
    switch (response.answer) {
      case "a":
        return "Position";
      case "c":
        return "Year group";
      default:
        return "Details";
    }
  }
  return (
    <div className={classes.question}>
      <Box flexDirection="row">
        <div className={classes.questionText}>
          {questionNumber}: {question.text}
        </div>
      </Box>
      <table className={classes.responsesGrid}>
        <tbody>
          {responses.map((response, i) => {
            return (
              <tr key={"" + i}>
                {getResponseNumberCell(responses, i + 1)}
                <td className="user-type">{getAnswer(response)}</td>
                <td>{labelTitle(response) ? response.comments : <></>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QuestionText({ question, questionNumber, responses }) {
  const classes = useStyles();

  function getAnswer(response) {
    return response.answer;
  }

  return (
    <div className={classes.question}>
      <Box flexDirection="row">
        <div className={classes.questionText}>
          {questionNumber}: {question.text}
        </div>
      </Box>
      <table className={classes.responsesGrid}>
        <tbody>
          {responses.map((response, i) => {
            return (
              <tr key={"" + i}>
                {getResponseNumberCell(responses, i + 1)}
                <td>{getAnswer(response)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QuestionTextWithYear({ question, questionNumber, responses }) {
  const classes = useStyles();

  function yearAnswerRow(
    responses,
    responseNumber,
    response,
    answerKey,
    yearKey
  ) {
    if (!hasValue(response[answerKey]) && !hasValue(response[yearKey])) {
      return null;
    }
    return (
      <tr key={responseNumber + answerKey}>
        {getResponseNumberCell(responses, responseNumber)}
        <td>{getValue(response[answerKey])}</td>
        <td className="year">{getValue(response[yearKey])}</td>
      </tr>
    );
  }

  // <Box className={classes.answer}>Improvement: {response[answerKey]}</Box>
  // <Box className={classes.answer}>Year: {response[yearKey]}</Box>
  return (
    <div className={classes.question}>
      <Box flexDirection="row">
        <div className={classes.questionText}>
          {questionNumber}: {question.text}
        </div>
      </Box>
      <table className={classes.responsesGrid}>
        <tbody>
          {responses.map((response, i) => {
            const result = [];
            const answer1 = yearAnswerRow(
              responses,
              i + 1,
              response,
              "answer1",
              "year1"
            );
            const answer2 = yearAnswerRow(
              responses,
              i + 1,
              response,
              "answer2",
              "year2"
            );
            const answer3 = yearAnswerRow(
              responses,
              i + 1,
              response,
              "answer3",
              "year3"
            );
            if (answer1 != null) {
              result.push(answer1);
            }
            if (answer2 != null) {
              result.push(answer2);
            }
            if (answer3 != null) {
              result.push(answer3);
            }
            return result;
          })}
        </tbody>
      </table>
    </div>
  );
}

function Section({ section, sectionResponses }) {
  const classes = useStyles();
  const sectionId = section.id;

  var questionIndex = 0;
  function addQuestion(type, id, text) {
    questionIndex += 1;
    const key = sectionId + "-" + id;
    const question = { id: id, text: text };
    const responses = sectionResponses.map(
      (sectionResponse) => sectionResponse[id]
    );

    if (SCALE_WITH_COMMENT === type) {
      return (
        <QuestionSelectWithComment
          key={key}
          question={question}
          questionNumber={questionIndex}
          responses={responses}
        />
      );
    }

    if (USER_TYPE_WITH_COMMENT === type) {
      return (
        <QuestionUserSelect
          key={key}
          question={question}
          questionNumber={questionIndex}
          responses={responses}
        />
      );
    }

    if (TEXT === type || TEXT_INLINE_LABEL === type) {
      return (
        <QuestionText
          key={key}
          question={question}
          questionNumber={questionIndex}
          inlineLabel={TEXT_INLINE_LABEL === type}
          responses={responses}
        />
      );
    }

    if (TEXT_WITH_YEAR === type) {
      return (
        <QuestionTextWithYear
          key={key}
          question={question}
          questionNumber={questionIndex}
          responses={responses}
        />
      );
    }

    throw new Error("unknown question type: " + type);
  }

  return (
    <Box className={classes.section} flexDirection="column">
      <h1>
        Section {section.number} - {section.title}
      </h1>
      {section.content(addQuestion)}
    </Box>
  );
}

function SurveyResponses({ surveys = [] }) {
  const classes = useStyles();

  if (surveys.length > 0) {
    surveys.forEach((item, i) => {
      console.log(item.surveyResponse);
    });
  }

  function renderSurveys() {
    const responses = surveys.map((item, i) => item.surveyResponse);
    return sectionsContent.map((section) => {
      return (
        <Section
          key={section.id}
          section={section}
          sectionResponses={responses.map((response) => response[section.id])}
        />
      );
    });
  }

  return (
    <div className={classes.paper}>
      {surveys.length > 0 ? renderSurveys() : <></>}
    </div>
  );
}

export default SurveyResponses;
