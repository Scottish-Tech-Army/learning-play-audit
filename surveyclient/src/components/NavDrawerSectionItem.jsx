import React from "react";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import { useSelector } from "react-redux";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Tooltip from "@material-ui/core/Tooltip";
import CommentIcon from "@material-ui/icons/Comment";
import Badge from "@material-ui/core/Badge";

function NavDrawerSectionItem({
  section,
  currentSection,
  setCurrentSection,
  totalQuestions,
}) {
  const answerCounts = useSelector((state) => state.answerCounts[section.id]);

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
    <ListItem
      button
      selected={currentSection === section.id}
      onClick={(event) => setCurrentSection(section.id)}
      key={section.id}
      className="nav-menu-item"
    >
      <ListItemText primary={section.number + " - " + section.title} />
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
    </ListItem>
  );
}

export default NavDrawerSectionItem;
