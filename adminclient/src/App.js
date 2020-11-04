import React, { useEffect, useState } from "react";
import "./App.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import SurveyResultsTable from "./SurveyResultsTable";
import * as queries from "./graphql/queries";
// import * as subscriptions from "./graphql/subscriptions";
import Amplify from "aws-amplify";
import API, { graphqlOperation } from "@aws-amplify/api";
import aws_exports from "./aws-exports";
// import { withAuthenticator, AmplifySignOut } from "aws-amplify-react";
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

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
    async function fetchData() {
      const result = await API.graphql(
        graphqlOperation(queries.listSurveyResponses, { limit: 999 })
      );
      setSurveyResponses(result.data.listSurveyResponses.items);
    }
    fetchData();
  }, []);

  // useEffect(() => {
  //   let subscription;
  //   async function setupSubscription() {
  //     subscription = API.graphql(
  //       graphqlOperation(subscriptions.onCreateSurveyResponse, {})
  //     ).subscribe({
  //       next: (data) => {
  //         const surveyResponse = data.value.data.onCreateSurveyResponse;
  //         console.log("Subscription data", data);
  //         console.log("Updated survey response", surveyResponse);
  //         setSurveyResponses((a) => a.concat([surveyResponse]));
  //       },
  //     });
  //   }
  //   setupSubscription();
  //
  //   return () => subscription.unsubscribe();
  // }, []);

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
  signInConfig: {
    headerText: "wibble"
  },
});
