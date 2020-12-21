import React, { useEffect } from "react";
import "../App.css";
import { useSelector } from "react-redux";
import QuestionCommentDialog from "./QuestionCommentDialog";

export default function QuestionAddCommentButton({
  sectionId,
  questionId,
  questionNumber,
  questionText,
}) {
  const comments = useSelector(
    (state) => state.answers[sectionId][questionId].comments
  );

  const [showComment, setShowComment] = React.useState(false);
  const [hasComment, setHasComment] = React.useState(false);

  useEffect(() => {
    setHasComment(comments !== null && comments.length > 0);
  }, [comments, sectionId, questionId]);

  return (
    <>
      <button
        className="add-note-button"
        aria-label="add note"
        onClick={() => setShowComment(true)}
      >
        <img
          src={
            hasComment ? "/assets/add_note_ticked.svg" : "/assets/add_note.svg"
          }
          alt="add note"
        />
      </button>
      {showComment && (
        <QuestionCommentDialog
          sectionId={sectionId}
          questionId={questionId}
          questionNumber={questionNumber}
          questionText={questionText}
          closeDialog={() => setShowComment(false)}
        />
      )}
    </>
  );
}
