import React, { useEffect, useState } from "react";
import {
  AuthCurrentUser,
  Authenticator,
  isAuthenticating,
} from "learning-play-audit-shared";
import {
  sectionsContentMap,
  sectionsContent,
} from "learning-play-audit-survey";
import IntroductionSection from "./components/IntroductionSection";
import ResultsSection from "./components/ResultsSection";
import GallerySection from "./components/GallerySection";
import SubmitSection from "./components/SubmitSection";
import NavDrawer from "./components/NavDrawer";
import Section from "./components/Section";
import AuthSignOutWithConfirm from "./components/auth/AuthSignOutWithConfirm";
import RestartButton from "./components/RestartButton";
import GetStartedScreen from "./components/GetStartedScreen";
import { useDispatch, useSelector } from "react-redux";
import { refreshState } from "./model/SurveyModel";
import {
  INTRODUCTION,
  RESULTS,
  GALLERY,
  SUBMIT,
} from "./components/FixedSectionTypes";
import { Amplify } from "@aws-amplify/core";
import { menuButtonSvg } from "./components/SvgUtils";
import "./App.css";

// Configure these properties in .env.local
const AWS_CLIENT_API_ENDPOINT = process.env.REACT_APP_AWS_CLIENT_API_ENDPOINT;
const ENVIRONMENT_NAME = process.env.REACT_APP_DEPLOY_ENVIRONMENT;

const isLive = ENVIRONMENT_NAME === "LIVE";

const awsConfig = {
  Auth: {
    region: process.env.REACT_APP_AWS_REGION,
    userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_AWS_USER_POOL_WEB_CLIENT_ID,
  },
};

//window.LOG_LEVEL = "DEBUG";
// eslint-disable-next-line jest/require-hook
console.debug("Configure", Amplify.configure(awsConfig));

function App() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authentication.state);
  const hasSeenSplashPage = useSelector((state) => state.hasSeenSplashPage);

  const [currentSection, _setCurrentSection] = useState(INTRODUCTION);
  const [popupNavDrawerOpen, setPopupNavDrawerOpen] = useState(false);

  // Restore locally stored answers if existing
  useEffect(() => {
    dispatch(refreshState());
  }, [dispatch]);

  const [deferredInstallEvent, setDeferredInstallEvent] = useState(null);
  const [appInstalled, setAppInstalled] = useState(false);

  useEffect(() => {
    const listener = (event) => {
      console.debug("beforeinstallprompt triggered");
      event.preventDefault();
      setDeferredInstallEvent(event);
    };
    window.addEventListener("beforeinstallprompt", listener);

    return function cleanup() {
      window.removeEventListener("beforeinstallprompt", listener);
    };
  }, []);

  useEffect(() => {
    const listener = (event) => {
      console.log("PWA install successful");
      setAppInstalled(true);
    };
    window.addEventListener("appinstalled", listener);

    return function cleanup() {
      window.removeEventListener("appinstalled", listener);
    };
  }, []);

  useEffect(() => {
    const listener = () => {
      let displayMode = "browser tab";
      if (navigator.standalone) {
        displayMode = "standalone-ios";
        setAppInstalled(true);
      }
      if (window.matchMedia("(display-mode: standalone)").matches) {
        displayMode = "standalone";
        setAppInstalled(true);
      }
      console.debug("Running mode: ", displayMode);
    };
    window.addEventListener("DOMContentLoaded", listener);

    return function cleanup() {
      window.removeEventListener("DOMContentLoaded", listener);
    };
  }, []);

  useEffect(() => {
    const innerListener = (evt) => {
      let displayMode = "browser tab";
      if (evt.matches) {
        displayMode = "standalone";
        setAppInstalled(true);
      }
      console.debug("Running mode: ", displayMode);
    };
    const outerListener = () => {
      window
        .matchMedia("(display-mode: standalone)")
        .addListener(innerListener);
    };
    window.addEventListener("DOMContentLoaded", outerListener);

    return function cleanup() {
      window.removeEventListener("DOMContentLoaded", outerListener);
    };
  }, []);

  function handleInstall() {
    if (deferredInstallEvent != null) {
      deferredInstallEvent.prompt();
    }
  }

  function canInstall() {
    return deferredInstallEvent !== null && !appInstalled;
  }

  function downloadButtonMain() {
    if (!canInstall()) {
      return null;
    }

    return (
      <button
        aria-haspopup="true"
        aria-label="Install Application"
        onClick={handleInstall}
        className="download-button"
      >
        INSTALL SURVEY APP
      </button>
    );
  }

  function downloadButtonAppBar() {
    if (!canInstall()) {
      return null;
    }

    return (
      <button
        aria-haspopup="true"
        aria-label="Install Application"
        onClick={handleInstall}
        className="download-button"
      >
        <span className="large">INSTALL APP</span>
        <span className="small">INSTALL</span>
      </button>
    );
  }

  function setCurrentSection(sectionId) {
    _setCurrentSection(sectionId);
    setPopupNavDrawerOpen(false);
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
      return (
        <IntroductionSection
          sections={sections}
          setCurrentSection={setCurrentSection}
        />
      );
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
          endpoint={AWS_CLIENT_API_ENDPOINT}
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

  function titleText() {
    if (!hasSeenSplashPage || isAuthenticating(authState)) {
      return (
        <>
          <h1 className="title large">
            Welcome to the Learning through Landscapes
            <br />
            Learning and Play Audit Survey
          </h1>
          <h1 className="title small">
            Welcome to the
            <br />
            <span className="ltl-title">Learning through Landscapes</span>
            <br />
            Learning and Play Audit Survey
          </h1>
        </>
      );
    }

    return (
      <h1 className="title">
        Learning through Landscapes
        <br />
        Learning and Play Audit Survey
      </h1>
    );
  }

  function titleLogo() {
    return (
      <img className="title-logo" src="./assets/LTL_logo_large.png" alt="" />
    );
  }

  if (isAuthenticating(authState)) {
    return (
      <div className="root">
        <div className="background-overlay" />
        <div className="app-bar authenticating">
          {titleLogo()}
          {titleText()}
        </div>
        <main className="content authenticating">
          <Authenticator />
        </main>
      </div>
    );
  }

  if (!hasSeenSplashPage) {
    return (
      <div className="root">
        <div className="background-overlay" />
        <div className="app-bar authenticating">
          {titleLogo()}
          {titleText()}
          <AuthSignOutWithConfirm />
          <AuthCurrentUser />
        </div>
        <main className="content authenticating">
          <GetStartedScreen downloadButton={downloadButtonMain()} />
        </main>
      </div>
    );
  }

  return (
    <div className="root">
      <div className="app-bar main">
        <button
          aria-label="open drawer"
          onClick={() => setPopupNavDrawerOpen(true)}
          className="menu-button"
        >
          {menuButtonSvg()}
        </button>

        {titleLogo()}
        {titleText()}
        <AuthSignOutWithConfirm />
        <RestartButton returnToStart={() => setCurrentSection(INTRODUCTION)} />
        {downloadButtonAppBar()}
        {!isLive && <div className="environment-name">{ENVIRONMENT_NAME}</div>}
        <AuthCurrentUser />
      </div>
      <main className="content main">
        <NavDrawer
          popupDrawerOpen={popupNavDrawerOpen}
          onPopupClose={() => setPopupNavDrawerOpen(false)}
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
        />
        {getCurrentSection()}
      </main>
    </div>
  );
}

export default App;
