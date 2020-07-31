import React from "react";
import "./App.css";
import { content, introduction } from "./content";
import { makeStyles , withStyles} from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ResultsSection from "./ResultsSection";
import Section from "./Section";
import GetAppIcon from "@material-ui/icons/GetApp";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";

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
  // root: {
  //   flexGrow: 1,
  // },
  // menuButton: {
  //   marginRight: theme.spacing(2),
  // },
  title: {
    flexGrow: 1,
  },
}));

function App() {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState("introduction");

  const [open, setOpen] = React.useState(false);

  const handleGetAppClickOpen = () => {
    // setOpen(true);
  };

  const handleGetAppDialogClose = (install) => {
    console.log("handleGetAppDialogClose");
    setOpen(false);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  function createSection(section) {
    return (
      <Section
        section={section}
        expanded={expanded}
        handleAccordionChange={handleAccordionChange}
      />
    );
    // return (
    //   <Accordion
    //     key={section.id}
    //     expanded={expanded === section.id}
    //     onChange={handleAccordionChange(section.id)}
    //   >
    //     <AccordionSummary
    //       expandIcon={<ExpandMoreIcon />}
    //       aria-controls={section.id + "-content"}
    //       id={section.id + "-header"}
    //     >
    //       <Typography className={classes.heading}>
    //         Section {section.number}
    //       </Typography>
    //       <Typography className={classes.secondaryHeading}>
    //         {section.title}
    //       </Typography>
    //     </AccordionSummary>
    //     <AccordionDetails>
    //       {expanded === section.id && <Section section={section} />}
    //     </AccordionDetails>
    //   </Accordion>
    // );
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
          {expanded === "introduction" && (
            <Box flexDirection="column">{introduction}</Box>
          )}
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
  // <Dialog
  //   open={open}
  //   onClose={handleGetAppDialogClose(false)}
  //   aria-labelledby="alert-dialog-title"
  //   aria-describedby="alert-dialog-description"
  // >
  //   <DialogTitle id="alert-dialog-title">
  //     {"Install app?"}
  //   </DialogTitle>
  //   <DialogContent>
  //     <DialogContentText id="alert-dialog-description">
  //       Would you like to install this app?
  //     </DialogContentText>
  //   </DialogContent>
  //   <DialogActions>
  //     <Button
  //       onClick={handleGetAppDialogClose(false)}
  //       color="primary"
  //     >
  //       No
  //     </Button>
  //     <Button
  //       onClick={handleGetAppDialogClose(true)}
  //       color="primary"
  //       autoFocus
  //     >
  //       Yes
  //     </Button>
  //   </DialogActions>
  // </Dialog>

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
              onClick={() => {
                setOpen(true);
              }}
              color="inherit"
            >
              <GetAppIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {introductionSection()}
      {content.sections.map(createSection)}
      {resultsSection()}
    </div>
  );
}

export default App;
