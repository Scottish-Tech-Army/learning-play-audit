import React, { useEffect } from "react";
import "./App.css";
import { sectionsContentMap, sectionsContent } from "./model/Content";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IntroductionSection from "./components/IntroductionSection";
import ResultsSection from "./components/ResultsSection";
import GallerySection from "./components/GallerySection";
import SubmitSection from "./components/SubmitSection";
import NavDrawer from "./components/NavDrawer";
import Section from "./components/Section";
import DownloadButton from "./components/DownloadButton";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import { useDispatch } from "react-redux";
import { refreshState } from "./model/SurveyModel";
import MenuIcon from "@material-ui/icons/Menu";
import CssBaseline from "@material-ui/core/CssBaseline";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import {
  INTRODUCTION,
  RESULTS,
  GALLERY,
  SUBMIT,
} from "./components/FixedSectionTypes";
import Amplify from "aws-amplify";
// import awsconfig from "./aws-exports";
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
// import Amplify from '@aws-amplify/core'
// import { Auth } from '@aws-amplify/auth'
import awsconfig from './aws-exports'

Amplify.configure(awsconfig)
// Auth.configure(awsconfig)
// Amplify.configure(awsconfig);

const drawerWidth = 240;
// Amplify.Logger.LOG_LEVEL = 'DEBUG';
window.LOG_LEVEL = 'DEBUG';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  title: {
    flexGrow: 1,
  },

  root: {
    width: "100%",
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    zIndex: 2000,
    [theme.breakpoints.up("md")]: {
      width: "100%",
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    width: "100%",
    [theme.breakpoints.up("md")]: {
      marginLeft: drawerWidth,
    },
  },
  sectionContainer: {
    padding: "20px",
    width: "100%",
  },
}));

function App() {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [currentSection, _setCurrentSection] = React.useState("introduction");
  const [mobileOpen, setMobileOpen] = React.useState(false);

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

  function hasNextSection() {
    return (
      sections.findIndex((section) => section.id === currentSection) <
      sections.length - 1
    );
  }

  function hasPreviousSection() {
    return sections.findIndex((section) => section.id === currentSection) > 0;
  }

  const PREVIOUS_SECTION = 0;
  const NEXT_SECTION = 1;

  function getCurrentSection() {
    if (currentSection === INTRODUCTION) {
      return <IntroductionSection />;
    }
    if (currentSection === RESULTS) {
      return <ResultsSection />;
    }
    if (currentSection === GALLERY) {
      return <GallerySection />;
    }
    if (currentSection === SUBMIT) {
      return <SubmitSection />;
    }
    const section = sectionsContentMap.get(currentSection);
    return <Section key={section.id} section={section} />;
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Learning and Play Audit Tool
          </Typography>
          <AmplifySignOut />
          <DownloadButton />
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <NavDrawer
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
        />
        <div className={classes.toolbar} />
        <div className={classes.sectionContainer}>{getCurrentSection()}</div>
        <BottomNavigation
          showLabels
          onChange={(event, newValue) => {
            var index = sections.findIndex(
              (section) => section.id === currentSection
            );
            index += newValue === PREVIOUS_SECTION ? -1 : 1;
            if (index >= 0 && index < sections.length) {
              setCurrentSection(sections[index].id);
            }
          }}
        >
          <BottomNavigationAction
            disabled={!hasPreviousSection()}
            label="Previous section"
            value={PREVIOUS_SECTION}
            icon={<ArrowBackIosIcon />}
          />
          <BottomNavigationAction
            disabled={!hasNextSection()}
            value={NEXT_SECTION}
            label="Next section"
            icon={<ArrowForwardIosIcon />}
          />
        </BottomNavigation>
      </main>
    </div>
  );
}

export default withAuthenticator(App, {
  signUpConfig: {
    hiddenDefaults: ["phone_number"],
  },
  signInConfig: {
    // headerText: "wibble"
  },
});

// export default App;
