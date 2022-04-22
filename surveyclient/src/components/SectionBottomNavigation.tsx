import React from "react";
import { previousSectionSvg, nextSectionSvg } from "./SvgUtils";
import "../App.css";
import { SURVEY_SECTIONS } from "../model/SurveySections";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentSectionId } from "../model/SurveyModel";
import { SET_CURRENT_SECTION } from "../model/ActionTypes";

function SectionBottomNavigation() {
  const currentSectionId = useSelector(getCurrentSectionId);
  const dispatch = useDispatch();

  function hasNextSection() {
    return (
      SURVEY_SECTIONS.findIndex((section) => section.id === currentSectionId) <
      SURVEY_SECTIONS.length - 1
    );
  }

  function hasPreviousSection() {
    return (
      SURVEY_SECTIONS.findIndex((section) => section.id === currentSectionId) >
      0
    );
  }

  const PREVIOUS_SECTION = 0;
  const NEXT_SECTION = 1;

  function changeSection(
    direction: typeof PREVIOUS_SECTION | typeof NEXT_SECTION
  ) {
    var index = SURVEY_SECTIONS.findIndex(
      (section) => section.id === currentSectionId
    );
    index += direction === PREVIOUS_SECTION ? -1 : 1;
    if (index >= 0 && index < SURVEY_SECTIONS.length) {
      dispatch({
        type: SET_CURRENT_SECTION,
        sectionId: SURVEY_SECTIONS[index].id,
      });
    }
  }

  return (
    <div className="bottom-navigation">
      <button
        className={
          "previous-section-button" + (hasPreviousSection() ? "" : " hidden")
        }
        aria-label="previous section"
        disabled={!hasPreviousSection()}
        onClick={() => changeSection(PREVIOUS_SECTION)}
      >
        {previousSectionSvg()}
      </button>
      <button
        className={"next-section-button" + (hasNextSection() ? "" : " hidden")}
        disabled={!hasNextSection()}
        aria-label="next section"
        onClick={() => changeSection(NEXT_SECTION)}
      >
        {nextSectionSvg()}
      </button>
    </div>
  );
}

export default SectionBottomNavigation;
