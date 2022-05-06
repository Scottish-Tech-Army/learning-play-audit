import React from "react";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import { useSelector } from "react-redux";
import { getAnswerCounts, getCurrentSectionId } from "../model/SurveyModel";
import { Section } from "learning-play-audit-survey";

export interface SectionSummaryProps {
  section: Section;
  totalQuestions: number;
  onClick: () => void;
}

function SectionSummary({
  section,
  totalQuestions,
  onClick,
}: SectionSummaryProps) {
  const currentSectionId = useSelector(getCurrentSectionId);
  const answerCounts = useSelector(getAnswerCounts)[section.id];

  const progress = (answerCounts.answer * 100) / totalQuestions;
  const answerProgressLabel = answerCounts.answer + "/" + totalQuestions;
  const remainingQuestions =
    totalQuestions - answerCounts.answer === 1
      ? "1 question remaining"
      : totalQuestions - answerCounts.answer + " questions remaining";

  return (
    <div
      id={section.id}
      onClick={onClick}
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
