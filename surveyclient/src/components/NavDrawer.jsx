import React, { useEffect } from "react";
import { sectionsContent } from "learning-play-audit-shared";
import SectionSummary from "./SectionSummary";
import Modal from "@material-ui/core/Modal";
import { INTRODUCTION, RESULTS, GALLERY, SUBMIT } from "./FixedSectionTypes";
import { menuButtonSvg } from "./SvgUtils";

export default function NavDrawer({
  mobileOpen,
  handleDrawerToggle,
  currentSection,
  setCurrentSection,
}) {
  const [totalQuestionsMap, setTotalQuestionsMap] = React.useState(null);

  useEffect(() => {
    var result = new Map();
    sectionsContent.forEach((section) => {
      var questionCount = 0;
      section.content((type, id) => (questionCount += 1));
      result.set(section.id, questionCount);
    });
    setTotalQuestionsMap(result);
  }, []);

  const drawer = (
    <div className="nav-menu">
      {createMenuItem("Introduction", INTRODUCTION)}
      {sectionsContent.map(createSectionMenuItem)}
      {createMenuItem("Results", RESULTS)}
      {createMenuItem("Photos", GALLERY)}
      {createMenuItem("Submit survey", SUBMIT)}
    </div>
  );

  function createMenuItem(title, id) {
    return (
      <div
        className={
          "nav-menu-item " + id + (currentSection === id ? " selected" : "")
        }
        onClick={(event) => setCurrentSection(id)}
        key={id}
      >
        <span className="section-title">{title}</span>
      </div>
    );
  }

  function createSectionMenuItem(section) {
    return (
      <SectionSummary
        key={section.id}
        section={section}
        currentSectionId={currentSection}
        onClick={setCurrentSection}
        totalQuestions={
          totalQuestionsMap === null ? 0 : totalQuestionsMap.get(section.id)
        }
      />
    );
  }

  return (
    <>
      <Modal
        className="nav-menu-popup-modal"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        container={
          window !== undefined ? () => window.document.body : undefined
        }
        keepMounted={true}
      >
        <nav
          className={"nav-menu-container popup" + (mobileOpen ? "" : " hidden")}
          aria-label="survey sections"
        >
          <button
            aria-label="close drawer"
            onClick={handleDrawerToggle}
            className="menu-button"
          >
            {menuButtonSvg()}
          </button>
          {drawer}
        </nav>
      </Modal>
      <nav className="nav-menu-container fixed" aria-label="survey sections">
        {drawer}
      </nav>
    </>
  );
}
