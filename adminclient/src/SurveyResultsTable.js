import React, { useState, useEffect } from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import GetAppIcon from "@material-ui/icons/GetApp";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import { exportSurveysAsCsv } from "./SurveysAsCsv";
import SurveyResponsesDialog from "./SurveyResponsesDialog";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  title: {
    marginRight: "25px",
  },
  galleryButton: {
    margin: "5px",
  },
});

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    justifyContent: "space-between",
  },
}));

const MAX_AGGREGATE_SURVEYS = 6;

function TableToolbar({ numChecked, viewMultipleSurveys, exportCsv }) {
  const classes = useToolbarStyles();

  function viewButtonText() {
    if (numChecked <= 1) {
      return "View Survey";
    }
    if (numChecked <= 5) {
      return "View Surveys";
    }
    return "View Surveys (up to " + MAX_AGGREGATE_SURVEYS + " responses)";
  }
  return (
    <Toolbar classes={{ root: classes.root }}>
      {numChecked > 0 ? (
        <Typography color="inherit" variant="subtitle1" component="div">
          {numChecked} selected
        </Typography>
      ) : (
        <Typography variant="h6" component="div">
          Survey Responses
        </Typography>
      )}

      {numChecked > 0 ? (
        <div className="multiple-survey-actions">
          <Button
            onClick={viewMultipleSurveys}
            color="primary"
            startIcon={<GetAppIcon />}
            disabled={numChecked > MAX_AGGREGATE_SURVEYS}
          >
            {viewButtonText()}
          </Button>
          <Button
            onClick={exportCsv}
            color="primary"
            startIcon={<GetAppIcon />}
          >
            Export surveys as CSV
          </Button>
        </div>
      ) : (
        <></>
      )}
    </Toolbar>
  );
}

function SurveyResultsTable({ datarows = [], surveyResponses }) {
  const classes = useStyles;
  const [checkedSurveys, setCheckedSurveys] = useState([]);
  const [openSurveyResponses, setOpenSurveyResponses] = React.useState(false);

  useEffect(() => {
    setCheckedSurveys([]);
  }, [datarows]);

  function exportCsv() {
    exportSurveysAsCsv(
      surveyResponses.filter((surveyResponse) =>
        checkedSurveys.includes(surveyResponse.id)
      )
    );
  }

  const handleCheckAllClick = (event) => {
    setCheckedSurveys(event.target.checked ? datarows.map((n) => n.id) : []);
  };

  const handleCheckClick = (event, id) => {
    event.stopPropagation();
    setCheckedSurveys((checkedSurveys) => {
      const selectedIndex = checkedSurveys.indexOf(id);
      if (selectedIndex === -1) {
        return [...checkedSurveys, id];
      } else {
        return checkedSurveys.filter((item) => item !== id);
      }
    });
  };

  const numChecked = checkedSurveys.length;
  const rowCount = datarows.length;

  return (
    <Paper className={classes.paper}>
      <TableToolbar
        numChecked={numChecked}
        viewMultipleSurveys={() => setOpenSurveyResponses(true)}
        exportCsv={exportCsv}
      />
      <TableContainer>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={numChecked > 0 && numChecked < rowCount}
                  checked={rowCount > 0 && numChecked === rowCount}
                  onChange={handleCheckAllClick}
                  inputProps={{ "aria-label": "select all" }}
                />
              </TableCell>
              <TableCell>Submission Date</TableCell>
              <TableCell align="left">Id</TableCell>
              <TableCell align="left">School</TableCell>
              <TableCell align="left">Contact Name</TableCell>
              <TableCell align="left">Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datarows.map((row) => {
              const isItemChecked = checkedSurveys.indexOf(row.id) !== -1;

              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemChecked}
                  tabIndex={-1}
                  key={row.id}
                  selected={isItemChecked}
                  onClick={(event) => handleCheckClick(event, row.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={isItemChecked} />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.timestamp}
                  </TableCell>
                  <TableCell align="left">{row.id}</TableCell>
                  <TableCell align="left">{row.school}</TableCell>
                  <TableCell align="left">{row.contactName}</TableCell>
                  <TableCell align="left">{row.email}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <SurveyResponsesDialog
        isOpen={openSurveyResponses}
        surveys={surveyResponses.filter((surveyResponse) =>
          checkedSurveys.includes(surveyResponse.id)
        )}
        handleClose={() => {
          setOpenSurveyResponses(false);
        }}
      />
    </Paper>
  );
}

export default SurveyResultsTable;
