import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import {
  makeStyles,
  createTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import SurveyResultsTable from "./SurveyResultsTable";
import { Amplify } from "@aws-amplify/core";
import SurveyResponsesDialog from "./SurveyResponsesDialog";
import MfaSetupDialog from "./MfaSetupDialog";
import { exportSurveysAsCsv } from "./SurveysAsCsv";
import {
  Authenticator,
  getAuthState,
  getSurveyUser,
  isAuthenticating,
  signOut,
} from "learning-play-audit-shared";
import {
  retrieveSummaryResponses,
  retrieveFullSurveyResponses,
  allSurveysRetrieved,
  getFullSurveyResponses,
} from "./model/SurveyModel";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

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

// eslint-disable-next-line jest/require-hook
Amplify.configure(awsConfig);

const COLOUR_LTL_GREEN = "#afcd4b";
const COLOUR_BLACK = "#000";

const theme = createTheme({
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
  const authState = useSelector(getAuthState);
  const fullSurveyResponses = useSelector(getFullSurveyResponses);
  const user = useSelector(getSurveyUser);

  const classes = useStyles();
  const [openSurveyResponses, setOpenSurveyResponses] = useState(false);
  const [selectedSurveyIds, setSelectedSurveyIds] = useState<string[]>([]);
  const [exportCsvRequested, setExportCsvRequested] = useState(false);
  const appBarRef = useRef(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticating(authState)) {
      dispatch(retrieveSummaryResponses());
    }
  }, [authState, dispatch]);

  useEffect(() => {
    if (!isAuthenticating(authState)) {
      dispatch(retrieveFullSurveyResponses(selectedSurveyIds));
    }
  }, [authState, selectedSurveyIds, dispatch]);

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
              Learning through Landscapes Learning and Play Audit Admin
              {!isLive && " (" + ENVIRONMENT_NAME + ")"} - Overview
            </Typography>
            <div>
              <IconButton
                ref={appBarRef}
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={() => setUserMenuOpen(true)}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-user"
                anchorEl={appBarRef.current}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={userMenuOpen}
                onClose={() => setUserMenuOpen(false)}
              >
                <MenuItem disabled={true}>
                  {user && user.email ? user.email : ""}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setUserMenuOpen(false);
                    setMfaSetupOpen(true);
                  }}
                >
                  SET SECURITY
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setUserMenuOpen(false);
                    dispatch(signOut());
                  }}
                >
                  LOG OUT
                </MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
        <SurveyResultsTable
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
        {mfaSetupOpen && (
          <MfaSetupDialog handleClose={() => setMfaSetupOpen(false)} />
        )}
      </div>
    </ThemeProvider>
  );
}
