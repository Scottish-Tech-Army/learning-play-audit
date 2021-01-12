import React, { useEffect, useState } from "react";
import "./App.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import SurveyResultsTable from "./SurveyResultsTable";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { Amplify } from "@aws-amplify/core";
import { Auth } from "@aws-amplify/auth";
import {
  DynamoDBClient,
  ScanCommand,
  BatchGetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import SurveyResponsesDialog from "./SurveyResponsesDialog";
import { exportSurveysAsCsv } from "./SurveysAsCsv";

// Configure these properties in .env.local
const REGION = process.env.REACT_APP_AWS_REGION;
const SURVEY_RESPONSES_TABLE = process.env.REACT_APP_AWS_SURVEY_RESPONSES_TABLE;
const SURVEY_RESPONSES_SUMMARY_INDEX =
  process.env.REACT_APP_AWS_SURVEY_RESPONSES_SUMMARY_INDEX;
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
}));

function getSurveyIdsToRetrieve(selectedSurveyIds, fullSurveyResponses) {
  return selectedSurveyIds.filter(
    (surveyId) =>
      fullSurveyResponses.find(
        (fullSurveyResponse) => surveyId === fullSurveyResponse.id
      ) === undefined
  );
}

function App() {
  const classes = useStyles();
  const [surveyResponses, setSurveyResponses] = useState([]);
  const [fullSurveyResponses, setFullSurveyResponses] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [openSurveyResponses, setOpenSurveyResponses] = useState(false);
  const [selectedSurveyIds, setSelectedSurveyIds] = useState([]);
  const [exportCsvRequested, setExportCsvRequested] = useState(false);

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
    Auth.currentCredentials()
      .then((credentials) => {
        const dynamodbClient = new DynamoDBClient({
          region: REGION,
          credentials: credentials,
        });
        const params = {
          TableName: SURVEY_RESPONSES_TABLE,
          IndexName: SURVEY_RESPONSES_SUMMARY_INDEX,
          ReturnConsumedCapacity: "TOTAL",
        };
        console.log("Scanning data", params);
        return dynamodbClient.send(new ScanCommand(params));
      })
      .then((result) => {
        console.log("Survey responses", result);
        setSurveyResponses(result.Items.map((item) => unmarshall(item)));
      })
      .catch((error) => {
        console.log("Error retrieving data", error);
      });
  }, []);

  useEffect(() => {
    const surveyIdsToRetrieve = getSurveyIdsToRetrieve(
      selectedSurveyIds,
      fullSurveyResponses
    );
    if (surveyIdsToRetrieve.length > 0) {
      Auth.currentCredentials()
        .then((credentials) => {
          const dynamodbClient = new DynamoDBClient({
            region: REGION,
            credentials: credentials,
          });
          const params = {
            RequestItems: {},
            ReturnConsumedCapacity: "TOTAL",
          };
          params.RequestItems[SURVEY_RESPONSES_TABLE] = {
            Keys: surveyIdsToRetrieve.map((id) => {
              return { id: { S: id } };
            }),
          };
          console.log("Retrieving full responses data", params);
          return dynamodbClient.send(new BatchGetItemCommand(params));
        })
        .then((result) => {
          console.log("Survey responses", result);
          const retrievedResponses = result.Responses[
            SURVEY_RESPONSES_TABLE
          ].map((item) => unmarshall(item));
          setFullSurveyResponses((fullSurveyResponses) => [
            ...fullSurveyResponses,
            ...retrievedResponses,
          ]);
        })
        .catch((error) => {
          console.log("User not logged in", error);
        });
    }
  }, [selectedSurveyIds, fullSurveyResponses]);

  useEffect(() => {
    const surveyIdsToRetrieve = getSurveyIdsToRetrieve(
      selectedSurveyIds,
      fullSurveyResponses
    );
    if (exportCsvRequested && surveyIdsToRetrieve.length === 0) {
      setExportCsvRequested(false);

      exportSurveysAsCsv(
        fullSurveyResponses.filter((surveyResponse) =>
          selectedSurveyIds.includes(surveyResponse.id)
        )
      );
    }
  }, [selectedSurveyIds, fullSurveyResponses, exportCsvRequested]);

  function requestExportCsv(surveyIds) {
    setSelectedSurveyIds(surveyIds);
    setExportCsvRequested(true);
  }

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Learning and Play Audit Admin
            {!isLive && " (" + ENVIRONMENT_NAME + ")"} - Overview
          </Typography>
          <AmplifySignOut />
        </Toolbar>
      </AppBar>
      <SurveyResultsTable
        dataRows={dataRows}
        surveyResponses={surveyResponses}
        openSurveyResponses={(surveyIds) => {
          setSelectedSurveyIds(surveyIds);
          setOpenSurveyResponses(true);
        }}
        exportCsv={requestExportCsv}
      />
      <SurveyResponsesDialog
        isOpen={openSurveyResponses}
        surveys={fullSurveyResponses.filter((surveyResponse) =>
          selectedSurveyIds.includes(surveyResponse.id)
        )}
        handleClose={() => setOpenSurveyResponses(false)}
      />
    </div>
  );
}

export default withAuthenticator(App, {
  signUpConfig: {
    hiddenDefaults: ["phone_number"],
  },
});
