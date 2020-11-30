import React, { useEffect } from "react";
import { sectionsContent } from "../model/Content";
import NavDrawerSectionItem from "./NavDrawerSectionItem";
import Hidden from "@material-ui/core/Hidden";
import Modal from "@material-ui/core/Modal";
import { INTRODUCTION, RESULTS, GALLERY, SUBMIT } from "./FixedSectionTypes";

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
      <NavDrawerSectionItem
        section={section}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        totalQuestions={
          totalQuestionsMap === null ? 0 : totalQuestionsMap.get(section.id)
        }
      />
    );
  }

  return (
    <nav className="drawer" aria-label="survey sections">
      <Hidden mdUp>
        <Modal
          open={mobileOpen}
          onClose={handleDrawerToggle}
          container={
            window !== undefined ? () => window.document.body : undefined
          }
          keepMounted={true}
        >
          <div className={"nav-menu-popup" + (mobileOpen ? "" : " hidden")}>
            {drawer}
          </div>
        </Modal>
      </Hidden>
      <Hidden smDown implementation="css">
        <div className="nav-menu-fixed">{drawer}</div>
      </Hidden>
    </nav>
  );
}
