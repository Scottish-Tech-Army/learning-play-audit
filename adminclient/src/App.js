import React, { useEffect, useState } from "react";
import "./App.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import SurveyResultsTable from "./SurveyResultsTable";
import Amplify from "aws-amplify";
import aws_exports from "./aws-exports";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { Auth } from "@aws-amplify/auth";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

Amplify.configure(aws_exports);

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

function App() {
  const classes = useStyles();
  const [surveyResponses, setSurveyResponses] = useState([]);
  const [datarows, setDatarows] = useState([]);

  useEffect(() => {
    if (surveyResponses != null && surveyResponses.length > 0) {
      setDatarows(
        surveyResponses.map((item) => {
          return {
            id: item.id,
            timestamp: new Date(item.createdAt).toLocaleString(),
            school: item.schoolName,
            contactName: item.responderName,
            email: item.responderEmail,
          };
        })
      );
    }
  }, [surveyResponses]);

  useEffect(() => {
    Auth.currentCredentials()
      .then((credentials) => {
        console.log("Current credentials", credentials);
        const dynamodbClient = new DynamoDBClient({
          region: "eu-west-2",
          credentials: credentials,
        });
        async function fetchData() {
          const params = {
            TableName: aws_exports.surveyResponsesTable,
          };

          const result = await dynamodbClient.send(new ScanCommand(params));
          console.log("scan result", result);
          setSurveyResponses(result.Items.map((item) => unmarshall(item)));
        }
        fetchData();
      })
      .catch(() => {
        console.log("User not logged in");
      });
  }, []);

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Learning and Play Audit Admin - Overview
          </Typography>
          <AmplifySignOut />
        </Toolbar>
      </AppBar>
      <SurveyResultsTable
        datarows={datarows}
        surveyResponses={surveyResponses}
      />
    </div>
  );
}

export default withAuthenticator(App, {
  signUpConfig: {
    hiddenDefaults: ["phone_number"],
  },
});
