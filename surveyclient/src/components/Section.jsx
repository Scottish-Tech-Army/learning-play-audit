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
  sectionQuestions,
} from "learning-play-audit-survey";
import SectionSummary from "./SectionSummary";
import { renderMarkup } from "./RenderMarkup";

function Section({ section, sections, setCurrentSection }) {
  const SCROLL_OFFSET = 220;

  const sectionId = section.id;

  const [totalQuestions, setTotalQuestions] = useState(0);
  const sectionRef = useRef();

  useEffect(() => {
    setTotalQuestions(sectionQuestions(section).length);
  }, [section]);

  const answerCounts = useSelector(
    (state) => state.answerCounts[sectionId]["answer"]
  );
  const sectionAnswers = useSelector((state) => state.answers[sectionId]);

  var questionIndex = 0;

  function addQuestion({ type, id, text }) {
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
    sectionQuestions(section).forEach(({ type, id }) => {
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

  function addSubsectionDividers(subsections) {
     const result = [];
     subsections.forEach((subsection, i) => {
      result.push(subsection);
      if (i < subsections.length - 1) {
        result.push(<hr key={`${subsection.id}-${i}`} className="subsection-divider" />);
      }
    });
    return result;
  }

  function addQuestionDividers(questions, isBackground) {
    if (isBackground) {
      return questions;
    }
    const result = [];
    questions.forEach((question, i) => {
      result.push(question);
      if (i < questions.length - 1) {
        result.push(<hr key={`${question.id}-${i}`} className="question-divider" />);
      }
    });
    return result;
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
      {addSubsectionDividers(section.subsections.map((subsection) => {
        let result = [];
        if (subsection.title) {
          result.push(renderMarkup(subsection.title));
        }
        result.push(
          ...addQuestionDividers(
            subsection.questions.map(addQuestion),
            section.id === BACKGROUND
          )
        );
        return result;
      }))}
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
