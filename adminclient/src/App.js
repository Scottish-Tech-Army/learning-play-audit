import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import SurveyResultsTable from "./SurveyResultsTable";
import { Amplify } from "@aws-amplify/core";
import SurveyResponsesDialog from "./SurveyResponsesDialog";
import { exportSurveysAsCsv } from "./SurveysAsCsv";
import {
  Authenticator,
  AuthSignOut,
  isAuthenticating,
} from "learning-play-audit-shared";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import {
  getSummaryResponses,
  getFullResponses,
  allSurveysRetrieved,
} from "./model/SurveyModel";

// Configure these properties in .env.local
const REGION = process.env.REACT_APP_AWS_REGION;
const ENVIRONMENT_NAME = process.env.REACT_APP_DEPLOY_ENVIRONMENT;
const isLive = ENVIRONMENT_NAME === "LIVE";

const awsConfig = {
  Auth: {
    region: REGION,
    identityPoolId: process.env.REACT_APP_AWS_IDENTITY_POOL_ID,
    userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_AWS_USER_POOL_WEB_CLIENT_ID,
  },
};

Amplify.configure(awsConfig);

const COLOUR_LTL_GREEN = "#afcd4b";
const COLOUR_BLACK = "#000";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: COLOUR_BLACK,
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  authenticatingRoot: {
    backgroundImage: `url(${"/assets/Background_image.jpg"})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "top",
    backgroundAttachment: "fixed",
    width: "100%",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  appBar: {
    flexDirection: "row",
    color: "black",
    backgroundColor: COLOUR_LTL_GREEN,
  },
  toolBar: {
    flexGrow: 1,
  },
  partialLogo: {
    height: "50px",
    alignSelf: "flex-end",
  },
  title: {
    flexGrow: 1,
  },
}));

export default function App() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authentication.state);
  const surveyResponses = useSelector((state) => state.surveyResponses);
  const fullSurveyResponses = useSelector((state) => state.fullSurveyResponses);

  const classes = useStyles();
  const [dataRows, setDataRows] = useState([]);
  const [openSurveyResponses, setOpenSurveyResponses] = useState(false);
  const [selectedSurveyIds, setSelectedSurveyIds] = useState([]);
  const [exportCsvRequested, setExportCsvRequested] = useState(false);

  useEffect(() => {
    if (!isAuthenticating(authState)) {
      dispatch(getSummaryResponses());
    }
  }, [authState, dispatch]);

  useEffect(() => {
    if (surveyResponses != null && surveyResponses.length > 0) {
      setDataRows(
        surveyResponses.map((item) => {
          return {
            id: item.id,
            timestamp: item.createdAt,
            timestampString: new Date(item.createdAt).toLocaleString(),
            school: item.schoolName,
            contactName: item.responderName,
            email: item.responderEmail,
            uploadState: item.uploadState,
          };
        })
      );
    }
  }, [surveyResponses]);

  useEffect(() => {
    dispatch(getFullResponses(selectedSurveyIds));
  }, [selectedSurveyIds, dispatch]);

  useEffect(() => {
    if (
      exportCsvRequested &&
      allSurveysRetrieved(selectedSurveyIds, fullSurveyResponses)
    ) {
      setExportCsvRequested(false);
      exportSurveysAsCsv(
        selectedSurveyIds.map((id) => fullSurveyResponses[id])
      );
    }
  }, [selectedSurveyIds, fullSurveyResponses, exportCsvRequested]);

  if (isAuthenticating(authState)) {
    return (
      <main className={classes.authenticatingRoot}>
        <Authenticator canRegister={false} />
      </main>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <AppBar position="static" className={classes.appBar}>
          <img
            className={classes.partialLogo}
            src="./assets/toolbar-logo.png"
            alt=""
          />
          <Toolbar className={classes.toolBar}>
            <Typography variant="h6" className={classes.title}>
              Learning Through Landscapes Learning and Play Audit Admin
              {!isLive && " (" + ENVIRONMENT_NAME + ")"} - Overview
            </Typography>
            <AuthSignOut />
          </Toolbar>
        </AppBar>
        <SurveyResultsTable
          dataRows={dataRows}
          openSurveyResponses={(surveyIds) => {
            setSelectedSurveyIds(surveyIds);
            setOpenSurveyResponses(true);
          }}
          exportCsv={(surveyIds) => {
            setSelectedSurveyIds(surveyIds);
            setExportCsvRequested(true);
          }}
        />
        {openSurveyResponses && (
          <SurveyResponsesDialog
            surveyIds={selectedSurveyIds}
            handleClose={() => setOpenSurveyResponses(false)}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
