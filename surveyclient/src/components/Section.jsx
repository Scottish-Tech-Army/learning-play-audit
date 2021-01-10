import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import "../App.css";
import QuestionSelectWithComment from "./QuestionSelectWithComment";
import QuestionText from "./QuestionText";
import QuestionTextWithYear from "./QuestionTextWithYear";
import QuestionUserSelect from "./QuestionUserSelect";
import SectionBottomNavigation from "./SectionBottomNavigation";
import {
  BACKGROUND,
  SCALE_WITH_COMMENT,
  TEXT_AREA,
  TEXT_WITH_YEAR,
  TEXT_FIELD,
  USER_TYPE_WITH_COMMENT,
} from "learning-play-audit-shared";
import SectionSummary from "./SectionSummary";

function Section({ section, sections, setCurrentSection }) {
  const SCROLL_OFFSET = 220;

  const sectionId = section.id;

  const [totalQuestions, setTotalQuestions] = useState(0);
  const sectionRef = useRef();

  useEffect(() => {
    var questionCount = 0;
    section.content((type, id) => (questionCount += 1));
    setTotalQuestions(questionCount);
  }, [section]);

  const answerCounts = useSelector(
    (state) => state.answerCounts[sectionId]["answer"]
  );
  const sectionAnswers = useSelector((state) => state.answers[sectionId]);

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
        />
      );
    }

    if (TEXT_AREA === type || TEXT_FIELD === type) {
      return (
        <QuestionText
          key={key}
          sectionId={sectionId}
          question={question}
          questionNumber={questionIndex}
          textField={TEXT_FIELD === type}
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

  function findUnansweredQuestion() {
    let unansweredQuestionId = null;
    section.content((type, id) => {
      if (unansweredQuestionId !== null) {
        return;
      }

      let hasPreviousValue = false;
      if (type === TEXT_WITH_YEAR) {
        const previousValues = sectionAnswers[id];
        hasPreviousValue =
          Object.values(previousValues).find(
            (value) => value !== null && value.length > 0
          ) !== undefined;
      } else {
        const answer = sectionAnswers[id]["answer"];
        hasPreviousValue =
          answer !== null && answer !== undefined && answer.length > 0;
      }

      if (!hasPreviousValue) {
        unansweredQuestionId = id;
      }
    });
    return unansweredQuestionId;
  }

  function scrollToUnansweredQuestion() {
    if (answerCounts >= totalQuestions) {
      return;
    }

    const unansweredQuestionId = findUnansweredQuestion();
    if (unansweredQuestionId == null) {
      console.log("Unanswered question not found");
      return;
    }

    const element = document.getElementById(
      sectionId + "-" + unansweredQuestionId
    );
    window.scrollBy(
      window.scrollX,
      element.getBoundingClientRect().top - SCROLL_OFFSET
    );
  }

  return (
    <div className={"section survey " + section.id} ref={sectionRef}>
      <div className="mobile-header">
        <SectionSummary
          key={section.id}
          section={section}
          onClick={scrollToUnansweredQuestion}
          totalQuestions={totalQuestions}
        />
      </div>
      <h1 className="title">
        {section.number}. {section.title}
      </h1>
      {section.content(addQuestion)}
      {section.id !== BACKGROUND && <hr className="subsection-divider" />}
      <SectionBottomNavigation
        sections={sections}
        currentSectionId={sectionId}
        setCurrentSectionId={setCurrentSection}
      />
    </div>
  );
}

export default Section;
