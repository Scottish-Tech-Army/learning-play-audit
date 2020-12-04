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
import GetStartedScreen from "./components/GetStartedScreen";
import { useDispatch, useSelector } from "react-redux";
import { refreshState } from "./model/SurveyModel";
import {
  INTRODUCTION,
  RESULTS,
  GALLERY,
  SUBMIT,
} from "./components/FixedSectionTypes";
import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";
import Authenticator, {
  isAuthenticating,
} from "./components/auth/Authenticator";
import { menuButtonSvg } from "./components/SvgUtils";
import "./App.css";

Amplify.configure(awsconfig);

window.LOG_LEVEL = "DEBUG";

function App() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authentication.state);
  const newUser = useSelector((state) => state.newUser);

  const [currentSection, _setCurrentSection] = useState("introduction");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((mobileOpen) => !mobileOpen);
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

  function preSurvey() {
    return newUser || isAuthenticating(authState);
  }

  function getTitle() {
    if (preSurvey()) {
      return (
        <h1 className="title">
          Welcome to the
          <br />
          <span className="ltl-title">Learning Through Landscapes</span>
          <br />
          Learning and Play Audit Survey{" "}
        </h1>
      );
    }

    return (
      <h1 className="title">
        Learning Through Landscapes
        <br />
        Learning and Play Audit Survey{" "}
      </h1>
    );
  }

  return (
    <div className="root">
      <>
        <div className={"app-bar" + (preSurvey() ? " authenticating" : "")}>
          {!preSurvey() && (
            <button
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              className="menu-button"
            >
              {menuButtonSvg()}
            </button>
          )}

          <img
            className="title-logo-small"
            src="./assets/LTL_logo_small.png"
            alt=""
          />
          <img
            className="title-logo-large"
            src="./assets/LTL_logo_large.png"
            alt=""
          />
          {getTitle()}
          {!preSurvey() && (
            <>
              <AuthSignInOut />
              <AuthCurrentUser />
              <DownloadButton />
            </>
          )}
        </div>
        {!isAuthenticating(authState) && newUser && <GetStartedScreen />}
        {!isAuthenticating(authState) && !newUser && (
          <main className="content">
            <NavDrawer
              mobileOpen={mobileOpen}
              handleDrawerToggle={handleDrawerToggle}
              currentSection={currentSection}
              setCurrentSection={setCurrentSection}
            />
            <div className="section-container">{getCurrentSection()}</div>
          </main>
        )}
        <Authenticator />
      </>
    </div>
  );
}

export default App;
