import React from "react";
import "../App.css";
import Box from "@material-ui/core/Box";
import QuestionSelectWithComment from "./QuestionSelectWithComment";
import QuestionText from "./QuestionText";
import QuestionTextWithYear from "./QuestionTextWithYear";
import QuestionUserSelect from "./QuestionUserSelect";
import {
  SCALE_WITH_COMMENT,
  TEXT,
  TEXT_WITH_YEAR,
  TEXT_INLINE_LABEL,
  USER_TYPE_WITH_COMMENT,
} from "../model/QuestionTypes";

function Section({ section }) {
  const sectionId = section.id;

  var questionIndex = 0;
  function addQuestion(type, id, text) {
    questionIndex += 1;
    const key = sectionId + "-" + id;
    const question = { id: id, text: text };

    if (SCALE_WITH_COMMENT === type) {
      return (
        <QuestionSelectWithComment
          key={key}
          sectionId={sectionId}
          question={question}
          questionNumber={questionIndex}
        />
      );
    }

    if (USER_TYPE_WITH_COMMENT === type) {
      return (
        <QuestionUserSelect
          key={key}
          sectionId={sectionId}
          question={question}
          questionNumber={questionIndex}
        />
      );
    }

    if (TEXT === type || TEXT_INLINE_LABEL === type) {
      return (
        <QuestionText
          key={key}
          sectionId={sectionId}
          question={question}
          questionNumber={questionIndex}
          inlineLabel={TEXT_INLINE_LABEL === type}
        />
      );
    }

    if (TEXT_WITH_YEAR === type) {
      return (
        <QuestionTextWithYear
          key={key}
          sectionId={sectionId}
          question={question}
          questionNumber={questionIndex}
        />
      );
    }

    throw new Error("unknown question type: " + type);
  }

  console.log("Render section " + section.title);
  return (
    <Box flexDirection="column">
      <h1>
        Section {section.number} - {section.title}
      </h1>
      {section.content(addQuestion)}
    </Box>
  );
}

export default Section;
