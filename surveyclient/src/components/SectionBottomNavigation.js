import React from "react";
import { previousSectionSvg, nextSectionSvg } from "./SvgUtils";
import "../App.css";

function SectionBottomNavigation({
  sections,
  currentSectionId,
  setCurrentSectionId,
}) {
  function hasNextSection() {
    return (
      sections.findIndex((section) => section.id === currentSectionId) <
      sections.length - 1
    );
  }

  function hasPreviousSection() {
    return sections.findIndex((section) => section.id === currentSectionId) > 0;
  }

  const PREVIOUS_SECTION = 0;
  const NEXT_SECTION = 1;

  function changeSection(direction) {
    var index = sections.findIndex(
      (section) => section.id === currentSectionId
    );
    index += direction === PREVIOUS_SECTION ? -1 : 1;
    if (index >= 0 && index < sections.length) {
      setCurrentSectionId(sections[index].id);
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
