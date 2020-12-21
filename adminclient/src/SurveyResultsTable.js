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
import ListAltIcon from "@material-ui/icons/ListAlt";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";

import TablePagination from "@material-ui/core/TablePagination";
import TableSortLabel from "@material-ui/core/TableSortLabel";

const MAX_AGGREGATE_SURVEYS = 6;

const ORDER_ASCENDING = "asc";
const ORDER_DESCENDING = "desc";

const FIELD_ID = "id";
const FIELD_TIMESTAMP = "timestamp";
const FIELD_SCHOOL = "school";
const FIELD_CONTACT_NAME = "contactName";
const FIELD_EMAIL = "email";
const FIELD_STATE = "uploadState";

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

const useHeaderStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

function TableToolbar({ numSelected, viewSurveys, exportCsv }) {
  const classes = useToolbarStyles();

  function viewButtonText() {
    if (numSelected <= 1) {
      return "View Survey";
    }
    if (numSelected <= MAX_AGGREGATE_SURVEYS) {
      return "View Surveys";
    }
    return "View Surveys (up to " + MAX_AGGREGATE_SURVEYS + " responses)";
  }

  return (
    <Toolbar classes={{ root: classes.root }}>
      {numSelected > 0 ? (
        <Typography color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography variant="h6" component="div">
          Survey Responses
        </Typography>
      )}

      {numSelected > 0 ? (
        <div className="multiple-survey-actions">
          <Button
            onClick={viewSurveys}
            color="primary"
            startIcon={<ListAltIcon />}
            disabled={numSelected > MAX_AGGREGATE_SURVEYS}
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

function descendingComparator(a, b, orderBy) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];
  if (bValue === undefined || bValue === null) {
    return -1;
  }
  if (aValue === undefined || aValue === null) {
    return 1;
  }
  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

function getComparator(orderDirection, orderBy) {
  return orderDirection === ORDER_DESCENDING
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => descendingComparator(b, a, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function LTLTableHead({
  onSelectAllClick,
  orderDirection,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
}) {
  const classes = useHeaderStyles();

  const headCells = [
    { id: FIELD_TIMESTAMP, disablePadding: true, label: "Submission Date" },
    { id: FIELD_SCHOOL, disablePadding: false, label: "School" },
    { id: FIELD_CONTACT_NAME, disablePadding: false, label: "Contact Name" },
    { id: FIELD_EMAIL, disablePadding: false, label: "Email" },
    { id: FIELD_ID, disablePadding: false, label: "Id" },
    { id: FIELD_STATE, disablePadding: false, label: "State" },
  ];

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all" }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? orderDirection : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={
                orderBy === headCell.id ? orderDirection : ORDER_ASCENDING
              }
              onClick={(event) => onRequestSort(event, headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {orderDirection === ORDER_DESCENDING
                    ? "sorted descending"
                    : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function SurveyResultsTable({
  dataRows = [],
  surveyResponses,
  openSurveyResponses,
  exportCsv,
}) {
  const classes = useStyles;

  const [selectedSurveys, setSelectedSurveys] = useState([]);

  const [orderDirection, setOrderDirection] = React.useState(ORDER_DESCENDING);
  const [orderBy, setOrderBy] = React.useState(FIELD_TIMESTAMP);
  const [orderedDataRows, setOrderedDataRows] = React.useState([]);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  useEffect(() => {
    setSelectedSurveys([]);
  }, [dataRows]);

  useEffect(() => {
    setOrderedDataRows(
      stableSort(dataRows, getComparator(orderDirection, orderBy))
    );
  }, [dataRows, orderDirection, orderBy]);

  function handleRequestSort(event, property) {
    const isAsc = orderBy === property && orderDirection === ORDER_ASCENDING;
    setOrderDirection(isAsc ? ORDER_DESCENDING : ORDER_ASCENDING);
    setOrderBy(property);
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  function handleSelectAllClick(event) {
    setSelectedSurveys(event.target.checked ? dataRows.map((n) => n.id) : []);
  }

  function handleCheckClick(event, id) {
    event.stopPropagation();
    setSelectedSurveys((selectedSurveys) => {
      const selectedIndex = selectedSurveys.indexOf(id);
      if (selectedIndex === -1) {
        return [...selectedSurveys, id];
      } else {
        return selectedSurveys.filter((item) => item !== id);
      }
    });
  }

  const numSelected = selectedSurveys.length;
  const rowCount = dataRows.length;

  return (
    <Paper className={classes.paper}>
      <TableToolbar
        numSelected={numSelected}
        viewSurveys={() => openSurveyResponses(selectedSurveys)}
        exportCsv={() => exportCsv(selectedSurveys)}
      />
      <TableContainer>
        <Table className={classes.table} aria-label="simple table">
          <LTLTableHead
            numSelected={numSelected}
            orderDirection={orderDirection}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rowCount}
          />

          <TableBody>
            {orderedDataRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemChecked = selectedSurveys.indexOf(row.id) !== -1;

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
                    <TableCell component="th" scope="row" padding="none">
                      {row.timestampString}
                    </TableCell>
                    <TableCell align="left">{row.school}</TableCell>
                    <TableCell align="left">{row.contactName}</TableCell>
                    <TableCell align="left">{row.email}</TableCell>
                    <TableCell align="left">{row.id}</TableCell>
                    <TableCell align="left">{row.uploadState}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={dataRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={(event, newPage) => setPage(newPage)}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default SurveyResultsTable;
