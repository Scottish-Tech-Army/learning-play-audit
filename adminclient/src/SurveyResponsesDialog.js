import React, { useState } from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import PhotoGallery from "./PhotoGallery";
import SurveyResponses from "./SurveyResponses";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { exportSurveysAsDocx } from "./SurveysAsDoc";
import Tab from "@material-ui/core/Tab";
import TabPanel from "@material-ui/lab/TabPanel";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import GetAppIcon from "@material-ui/icons/GetApp";
import CloseIcon from "@material-ui/icons/Close";

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
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  photo: {
    height: "50px",
  },
  scrollPaper: {
    alignItems: "start",
  },
}));

function SurveyResponsesDialog({ isOpen, surveys, handleClose }) {
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState("1");

  const handleExportAsDocx = () => {
    exportSurveysAsDocx(surveys);
  };

  return (
    <Dialog
      className="multiple-surveys-response"
      classes={{
        scrollPaper: classes.scrollPaper,
      }}
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      maxWidth="lg"
      fullWidth
    >
      <DialogContent dividers={true}>
        <TabContext value={selectedTab}>
          <TabList
            className={classes.titlebar}
            onChange={(event, newValue) => setSelectedTab(newValue)}
          >
            <DialogTitle id="scroll-dialog-title">Survey Responses</DialogTitle>
            <Tab label="Responses" value="1" />
            <Tab label="Photos" value="2" />
          </TabList>
          <TabPanel value="1">
            <SurveyResponses id="scroll-dialog-description" surveys={surveys} />
          </TabPanel>
          <TabPanel value="2">
            <PhotoGallery
              id="scroll-photosdialog-description"
              surveys={surveys}
            />
          </TabPanel>
        </TabContext>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleExportAsDocx} color="primary" startIcon={<GetAppIcon />}>
          Export {surveys.length > 1 ? "surveys" : "survey"} as Word Document
        </Button>
        <Button onClick={handleClose} color="primary" startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SurveyResponsesDialog;
