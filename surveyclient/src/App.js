import React, { useEffect, useState } from "react";
import { sectionsContentMap, sectionsContent } from "./model/Content";
import IntroductionSection from "./components/IntroductionSection";
import ResultsSection from "./components/ResultsSection";
import GallerySection from "./components/GallerySection";
import SubmitSection from "./components/SubmitSection";
import NavDrawer from "./components/NavDrawer";
import Section from "./components/Section";
import DownloadButton from "./components/DownloadButton";
import AuthSignInOut from "./components/auth/AuthSignInOut";
import AuthCurrentUser from "./components/auth/AuthCurrentUser";
import IconButton from "@material-ui/core/IconButton";
import { useDispatch } from "react-redux";
import { refreshState } from "./model/SurveyModel";
import MenuIcon from "@material-ui/icons/Menu";
import {
  INTRODUCTION,
  RESULTS,
  GALLERY,
  SUBMIT,
} from "./components/FixedSectionTypes";
import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";
import Authenticator from "./components/auth/Authenticator";
import "./App.css";

Amplify.configure(awsconfig);

window.LOG_LEVEL = "DEBUG";

function App() {
  const dispatch = useDispatch();

  const [currentSection, _setCurrentSection] = useState("introduction");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Restore locally stored answers if existing
  useEffect(() => {
    dispatch(refreshState());
  }, [dispatch]);

  function setCurrentSection(sectionId) {
    _setCurrentSection(sectionId);
    setMobileOpen(false);
    window.scrollTo({
      top: 0,
    });
  }

  const sections = [];
  sections.push({ title: "Introduction", id: INTRODUCTION });
  sectionsContent.forEach((section) =>
    sections.push({ title: section.title, id: section.id })
  );
  sections.push({ title: "Results", id: RESULTS });
  sections.push({ title: "Photos", id: GALLERY });
  sections.push({ title: "Submit survey", id: SUBMIT });

  function getCurrentSection() {
    if (currentSection === INTRODUCTION) {
      return <IntroductionSection />;
    }
    if (currentSection === RESULTS) {
      return (
        <ResultsSection
          sections={sections}
          setCurrentSection={setCurrentSection}
        />
      );
    }
    if (currentSection === GALLERY) {
      return (
        <GallerySection
          sections={sections}
          setCurrentSection={setCurrentSection}
        />
      );
    }
    if (currentSection === SUBMIT) {
      return (
        <SubmitSection
          sections={sections}
          setCurrentSection={setCurrentSection}
        />
      );
    }
    const section = sectionsContentMap.get(currentSection);
    return (
      <Section
        key={section.id}
        section={section}
        sections={sections}
        setCurrentSection={setCurrentSection}
      />
    );
  }

  return (
    <div className="root">
      <div className="app-bar">
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          className="menu-button"
        >
          <MenuIcon />
        </IconButton>
        <img className="titleLogo" src="./assets/LTL_logo_white.png" alt="" />
        <h1 className="title">
          Learning Through Landscapes
          <br />
          Learning and Play Audit Survey
        </h1>
        <AuthSignInOut />
        <AuthCurrentUser />
        <DownloadButton />
      </div>
      <main className="content">
        <NavDrawer
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
        />
        <div className="section-container">{getCurrentSection()}</div>
      </main>
      <Authenticator />
    </div>
  );
}

export default App;
