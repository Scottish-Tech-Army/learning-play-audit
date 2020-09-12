import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { SET_ANSWER, REFRESH_STATE, RESET_STATE } from "./ActionTypes.js";
import { sectionsContent, SURVEY_VERSION } from "./Content";
import { TEXT_WITH_YEAR } from "./QuestionTypes";
import localforage from "localforage";

localforage.config({
  // driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
  name: "learning-play-audit",
  version: 1.0,
  // size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName: "surveyanswers", // Should be alphanumeric, with underscores.
  description: "survey answers",
});

function createEmptyAnswers() {
  return sectionsContent.reduce(
    (sections, section) => {
      var questions = {};
      sections[section.id] = questions;
      // Use addQuestion to gather question ids
      section.content(
        (type, id) =>
          (questions[id] =
            type === TEXT_WITH_YEAR
              ? {
                  answer1: null,
                  year1: null,
                  answer2: null,
                  year2: null,
                  answer3: null,
                  year3: null,
                }
              : { answer: null, comments: "" })
      );
      return sections;
    },
    { surveyVersion: SURVEY_VERSION }
  );
}

function createAnswerCounts() {
  return sectionsContent.reduce((sections, section) => {
    sections[section.id] = { answer: 0, comments: 0 };
    return sections;
  }, {});
}

function initialState() {
  return { answers: createEmptyAnswers(), answerCounts: createAnswerCounts() };
}

// Exported for unit tests only
export function surveyReducer(state = initialState(), action) {
  switch (action.type) {
    case SET_ANSWER:
      console.log("SET_ANSWER");
      var newState = setAnswer(state, action);
      writeAnswers(newState);
      return newState;

    case RESET_STATE:
      console.log("RESET_STATE");
      newState = initialState();
      writeAnswers(newState);
      return newState;

    case REFRESH_STATE:
      console.log("REFRESH_STATE");
      return action.state;

    default:
      console.log("Unknown action: " + safeJson(action));
      return state;
  }
}

export function refreshState() {
  return function (dispatch, getState) {
    readAnswers()
      .then((oldState) => {
        console.log("readAnswers");
        console.log(oldState);
        if (oldState !== null) {
          dispatch({
            type: REFRESH_STATE,
            state: oldState,
          });
        } else {
          const state = getState();
          console.log("writeAnswers");
          console.log(state);
          writeAnswers(state);
        }
      })
      .catch((err) => console.log(err));
  };
}

const writeAnswers = (data) => localforage.setItem("answers", data);
const readAnswers = () => localforage.getItem("answers");

// removeData = key => localforage.removeItem(key)
// clear = () => localforage.clear()

function setAnswer(state, { sectionId, questionId, field, value }) {
  const previousValue = state.answers[sectionId][questionId][field];
  const answer = { ...state.answers[sectionId][questionId], [field]: value };
  const result = { ...state };
  result.answers[sectionId][questionId] = answer;

  if (previousValue === null || previousValue.length === 0) {
    if (value !== null && value.length > 0) {
      result.answerCounts[sectionId] = { ...result.answerCounts[sectionId] };
      result.answerCounts[sectionId][field] =
        result.answerCounts[sectionId][field] + 1;
    }
  } else {
    if (value === null || value.length === 0) {
      result.answerCounts[sectionId] = { ...result.answerCounts[sectionId] };
      result.answerCounts[sectionId][field] =
        result.answerCounts[sectionId][field] - 1;
    }
  }
  return result;
}

export default createStore(surveyReducer, applyMiddleware(thunk));

export function getResultsJson(state) {
  return state.answers;
}

/*
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};*/

function safeJson(value) {
  //return JSON.stringify(value, getCircularReplacer());
  return JSON.stringify(value);
}
