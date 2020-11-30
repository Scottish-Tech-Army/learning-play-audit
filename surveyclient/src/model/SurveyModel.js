import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {
  SET_ANSWER,
  REFRESH_STATE,
  RESET_STATE,
  ADD_PHOTO,
  DELETE_PHOTO,
  UPDATE_PHOTO_DESCRIPTION,
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "./ActionTypes.js";
import { sectionsContent, SURVEY_VERSION } from "./Content";
import { TEXT_WITH_YEAR } from "./QuestionTypes";
import localforage from "localforage";
import { v4 as uuidv4 } from "uuid";
import { SIGNED_OUT } from "./AuthStates";

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
                  photocount: 0,
                }
              : { answer: null, comments: "", photocount: 0 })
      );
      return sections;
    },
    { surveyVersion: SURVEY_VERSION }
  );
}

function listQuestionIds() {
  sectionsContent.forEach((section, i) => {
    // Use addQuestion to gather question ids
    section.content((type, id) =>
      console.log(section.id + "-" + id + "   " + type)
    );
  });
}

function createAnswerCounts() {
  return sectionsContent.reduce((sections, section) => {
    sections[section.id] = { answer: 0, comments: 0 };
    return sections;
  }, {});
}

function initialState() {
  // listQuestionIds();
  return {
    answers: createEmptyAnswers(),
    answerCounts: createAnswerCounts(),
    photos: {},
    photoDetails: {},
    authentication: {
      errorMessage: "",
      state: SIGNED_OUT,
      user: undefined,
    },
  };
}

// Exported for unit tests only
export function surveyReducer(state = initialState(), action) {
  let newState;
  switch (action.type) {
    case SET_ANSWER:
      console.log("SET_ANSWER");
      newState = setAnswer(state, action);
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

    case ADD_PHOTO:
      console.log("ADD_PHOTO");
      newState = addPhoto(state, action);
      writePhotos(newState);
      return newState;

    case DELETE_PHOTO:
      console.log("DELETE_PHOTO");
      newState = deletePhoto(state, action);
      writePhotos(newState);
      return newState;

    case UPDATE_PHOTO_DESCRIPTION:
      // console.log("UPDATE_PHOTO_DESCRIPTION");
      newState = updatePhotoDescription(state, action);
      writeAnswers(newState);
      return newState;

    case SET_AUTH_STATE:
      // console.log("SET_AUTH_STATE");
      return setAuthState(state, action);

    case SET_AUTH_ERROR:
      // console.log("SET_AUTH_ERROR");
      return setAuthError(state, action);

    case CLEAR_AUTH_ERROR:
      // console.log("CLEAR_AUTH_ERROR");
      return clearAuthError(state);

    default:
      console.log("Unknown action: " + safeJson(action));
      return state;
  }
}

function addPhoto(state, action) {
  console.log("addPhoto");
  console.log(action);
  const photoId = uuidv4();
  const result = { ...state };
  result.photoDetails = state.photoDetails ? { ...state.photoDetails } : {};
  result.photoDetails[photoId] = { description: "" };
  result.photos = state.photos ? { ...state.photos } : {};
  result.photos[photoId] = { imageData: action.imageData };
  console.log(state);
  console.log(result);
  return result;
}

export function loadPhoto(file) {
  console.log("loadPhoto");
  return function (dispatch) {
    if (window.FileReader) {
      return readFileAsync(file)
        .then((data) => {
          dispatch({
            type: ADD_PHOTO,
            imageData: btoa(data),
          });
        })
        .catch((err) => {
          console.log("Error");
          console.log(err);
          if (err.target.error.name === "NotReadableError") {
            alert("Cannot read file !");
          }
        });
    } else {
      alert("FileReader is not supported in this browser.");
    }
  };
}

function readFileAsync(file) {
  console.log("readFileAsync");
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      console.log("photo loaded");
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsBinaryString(file);
  });
}

function deletePhoto(state, action) {
  console.log("deletePhoto");
  console.log(action);
  const result = { ...state };
  result.photoDetails = state.photoDetails ? { ...state.photoDetails } : {};
  delete result.photoDetails[action.photoId];
  result.photos = state.photos ? { ...state.photos } : {};
  delete result.photos[action.photoId];
  return result;
}

function updatePhotoDescription(state, action) {
  const result = state;
  const photo = result.photoDetails[action.photoId];
  if (photo === undefined) {
    return result;
  }
  photo.description = action.description;
  return result;
}

const writePhotos = ({ photos }) => {
  console.log("writePhotos");
  console.log({ photos: photos });
  localforage.setItem("photos", { photos: photos });
};
const readPhotos = () => localforage.getItem("photos");

export function refreshState() {
  return function (dispatch, getState) {
    readAnswers()
      .then((storedState) => {
        console.log("readAnswers");
        console.log(storedState);
        const state = getState();
        if (storedState !== null) {
          dispatch({
            type: REFRESH_STATE,
            state: { ...state, ...storedState },
          });
        } else {
          console.log("writeAnswers");
          console.log(state);
          writeAnswers(state);
        }
      })
      .catch((err) => console.log(err));

    readPhotos()
      .then((storedState) => {
        console.log("readPhotos");
        console.log(storedState);
        const state = getState();
        if (storedState !== null) {
          dispatch({
            type: REFRESH_STATE,
            state: { ...state, ...storedState },
          });
        } else {
          console.log("writePhotos");
          console.log(state);
          writePhotos(state);
        }
      })
      .catch((err) => console.log(err));
  };
}

const writeAnswers = ({ answers, answerCounts, photoDetails }) =>
  localforage.setItem("answers", {
    answers: answers,
    answerCounts: answerCounts,
    photoDetails: photoDetails,
  });
const readAnswers = () => localforage.getItem("answers");

// removeData = key => localforage.removeItem(key)
// clear = () => localforage.clear()

function setAnswer(state, { sectionId, questionId, field, value }) {
  if (sectionId === "community" && questionId === "datedImprovements") {
    // Special case
    return setDatedImprovementsAnswer(
      state,
      sectionId,
      questionId,
      field,
      value
    );
  }

  const previousValue = state.answers[sectionId][questionId][field];
  const answer = { ...state.answers[sectionId][questionId], [field]: value };
  const result = { ...state };
  result.answers[sectionId][questionId] = answer;

  const hasPreviousValue = previousValue !== null && previousValue.length > 0;
  const hasCurrentValue = value !== null && value.length > 0;

  if (hasPreviousValue !== hasCurrentValue) {
    result.answerCounts[sectionId] = { ...result.answerCounts[sectionId] };
    result.answerCounts[sectionId][field] += hasCurrentValue ? 1 : -1;
  }

  return result;
}

function setDatedImprovementsAnswer(
  state,
  sectionId,
  questionId,
  field,
  value
) {
  const previousValues = state.answers[sectionId][questionId];
  const answer = { ...state.answers[sectionId][questionId], [field]: value };
  const result = { ...state };
  result.answers[sectionId][questionId] = answer;

  const hasPreviousValue =
    Object.values(previousValues).find(
      (value) => value !== null && value.length > 0
    ) !== undefined;
  const hasCurrentValue =
    Object.values(answer).find(
      (value) => value !== null && value.length > 0
    ) !== undefined;

  if (hasPreviousValue !== hasCurrentValue) {
    result.answerCounts[sectionId] = { ...result.answerCounts[sectionId] };
    result.answerCounts[sectionId]["answer"] += hasCurrentValue ? 1 : -1;
  }
  return result;
}

function setAuthState(state, { authState, user }) {
  console.log("setAuthState", authState);

  if (authState === undefined) {
    console.error("authState cannot be undefined");
    return state;
  }

  const result = { ...state };
  result.authentication.state = authState;
  result.authentication.user = user;

  // TODO necessary?
  // if (authState === SIGNED_IN) {
  //   try {
  //     result.authentication.user = await Auth.currentAuthenticatedUser();
  //   } catch (e) {
  //     logger.error("User is not authenticated");
  //   }
  // }

  return clearAuthError(result);
}

function setAuthError(state, { message }) {
  console.log("setAuthError", message);
  if (state.authentication.errorMessage === message) {
    return state;
  }
  const result = { ...state };
  result.authentication.errorMessage = message;
  return result;
}

function clearAuthError(state) {
  console.log("clearAuthError");
  if (state.authentication.errorMessage === "") {
    return state;
  }
  const result = { ...state };
  result.authentication.errorMessage = "";
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
