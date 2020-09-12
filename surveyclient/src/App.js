import React, { useEffect } from "react";
import "./App.css";
import { sectionsContent, introduction } from "./model/Content";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ResultsSection from "./components/ResultsSection";
import Section from "./components/Section";
import GetAppIcon from "@material-ui/icons/GetApp";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import { useDispatch } from "react-redux";
import { refreshState } from "./model/SurveyModel";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
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
}));

function App() {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState("introduction");

  const dispatch = useDispatch();

  // Restore locally stored answers if existing
  useEffect(() => {
    dispatch(refreshState());
  }, [dispatch]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  function createSection(section) {
    return (
      <Section
        key={section.id}
        section={section}
        expanded={expanded}
        handleAccordionChange={handleAccordionChange}
      />
    );
  }

  const AccordionSummary = withStyles({
    root: {
      backgroundColor: "rgba(0, 0, 0, .05)",
    },
    content: {
      alignItems: "center",
    },
  })(MuiAccordionSummary);

  function introductionSection() {
    return (
      <Accordion
        expanded={expanded === "introduction"}
        onChange={handleAccordionChange("introduction")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={"introduction-content"}
          id={"introduction-header"}
        >
          <Typography className={classes.heading}>Introduction</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {expanded === "introduction" && introduction}
        </AccordionDetails>
      </Accordion>
    );
  }

  function resultsSection() {
    return (
      <Accordion
        expanded={expanded === "results"}
        onChange={handleAccordionChange("results")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={"results-content"}
          id={"results-header"}
        >
          <Typography className={classes.heading}>Results</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {expanded === "results" && <ResultsSection />}
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Learning and Play Audit Tool
          </Typography>
          <div>
            <IconButton
              aria-label="get application"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
            >
              <GetAppIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {introductionSection()}
      {sectionsContent.map(createSection)}
      {resultsSection()}
    </div>
  );
}

export default App;
