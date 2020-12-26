import React from "react";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import { useSelector } from "react-redux";

function SectionSummary({
  section,
  currentSectionId,
  onClick,
  totalQuestions,
}) {
  const answerCounts = useSelector((state) => state.answerCounts[section.id]);

  const progress = (answerCounts.answer * 100) / totalQuestions;
  const answerProgressLabel = answerCounts.answer + "/" + totalQuestions;
  const remainingQuestions =
    totalQuestions - answerCounts.answer === 1
      ? "1 question remaining"
      : totalQuestions - answerCounts.answer + " questions remaining";

  return (
    <div
      onClick={(event) => onClick(section.id)}
      className={
        "nav-menu-item" + (currentSectionId === section.id ? " selected" : "")
      }
    >
      <span className="section-number">{section.number}</span>
      <span className="section-title">{section.title}</span>
      <CircularProgressWithLabel
        value={progress}
        label={answerProgressLabel}
        tooltip={remainingQuestions}
      />
    </div>
  );
}

export default SectionSummary;
