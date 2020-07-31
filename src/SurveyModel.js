import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {
  SET_ANSWER,
  RESET_STATE,
} from "./ActionTypes.js";
import { content } from "./content";

function createEmptyAnswers() {
  return content.sections.reduce((sections, section) => {
    sections[section.id] = section.questions.reduce((questions, question) => {
      questions[question.id] = {answer: null, comments: ""};
      return questions;
    }, {});
    return sections;
  }, {});
}

function createAnswerCounts() {
    return content.sections.reduce((sections, section) => {
      sections[section.id] = {answer: 0, comments: 0};
      return sections;
    }, {});
}

function initialState() {
    return {answers:createEmptyAnswers(), answerCounts: createAnswerCounts()};
}

// Exported for unit tests only
export function surveyReducer(state = initialState(), action) {
  switch (action.type) {
    case SET_ANSWER:
      return setAnswer(state, action);


    case RESET_STATE:
      return initialState();

    default:
      // Skip logging this one - CsvHandling will pick it up
    console.log("Unknown action: " + safeJson(action));
      return state;
  }
}

function setAnswer(state, {sectionId, questionId, field, value}) {
    const previousValue = state.answers[sectionId][questionId][field];
    const answer = {...state.answers[sectionId][questionId], [field]:value};
    const result = { ...state };
    result.answers[sectionId][questionId] = answer;

    if (previousValue === null || previousValue.length === 0) {
        if (value !== null && value.length > 0) {
            result.answerCounts[sectionId] = {...result.answerCounts[sectionId]};
            result.answerCounts[sectionId][field] = result.answerCounts[sectionId][field] + 1;
        }
    } else {
        if (value === null || value.length === 0) {
            result.answerCounts[sectionId] = {...result.answerCounts[sectionId]};
            result.answerCounts[sectionId][field] = result.answerCounts[sectionId][field] - 1;
        }
    }
    return result;
}



export default createStore(surveyReducer, applyMiddleware(thunk));

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
