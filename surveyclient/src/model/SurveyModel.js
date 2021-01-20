import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {
  SET_ANSWER,
  REFRESH_STATE,
  RESTART_SURVEY,
  RESET_STATE,
  ADD_PHOTO,
  DELETE_PHOTO,
  UPDATE_PHOTO_DESCRIPTION,
  CONFIRM_WELCOME,
} from "./ActionTypes";
import {
  sectionsContent,
  SURVEY_VERSION,
  TEXT_WITH_YEAR,
  authReducer,
  SET_AUTH_STATE,
  REGISTER,
} from "learning-play-audit-shared";
import localforage from "localforage";
import { v4 as uuidv4 } from "uuid";

localforage.config({
  name: "learning-play-audit",
  version: 1.0,
  storeName: "surveyanswers",
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
                  answer1: "",
                  year1: "",
                  answer2: "",
                  year2: "",
                  answer3: "",
                  year3: "",
                }
              : { answer: "", comments: "" })
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
  // console.log("Setting initialState");
  return {
    answers: createEmptyAnswers(),
    answerCounts: createAnswerCounts(),
    photos: {},
    photoDetails: {},
    authentication: {
      errorMessage: "",
      state: REGISTER,
      user: undefined,
    },
    hasSeenSplashPage: false,
    hasEverLoggedIn: false,
    initialisingState: true,
  };
}

// Exported for unit tests only
function surveyAnswersReducer(state, action) {
  let newState;
  switch (action.type) {
    case CONFIRM_WELCOME:
      // console.log("CONFIRM_WELCOME");
      newState = { ...state, hasSeenSplashPage: true, hasEverLoggedIn: true };
      writeAnswers(newState);
      return newState;

    case SET_ANSWER:
      // console.log("SET_ANSWER", action);
      newState = setAnswer(state, action);
      writeAnswers(newState);
      return newState;

    case RESET_STATE:
      // console.log("RESET_STATE");
      newState = { ...initialState(), initialisingState: false };
      writeAnswers(newState);
      writePhotos(newState);
      return newState;

    case RESTART_SURVEY:
      // console.log("RESTART_SURVEY");
      newState = {
        ...state,
        answers: createEmptyAnswers(),
        answerCounts: createAnswerCounts(),
        photos: {},
        photoDetails: {},
        initialisingState: false,
      };
      writeAnswers(newState);
      writePhotos(newState);
      return newState;

    case REFRESH_STATE:
      // console.log("REFRESH_STATE", action.state);
      return action.state;

    case ADD_PHOTO:
      // console.log("ADD_PHOTO");
      newState = addPhoto(state, action);
      writeAnswers(newState);
      writePhotos(newState);
      return newState;

    case DELETE_PHOTO:
      // console.log("DELETE_PHOTO");
      newState = deletePhoto(state, action);
      writeAnswers(newState);
      writePhotos(newState);
      return newState;

    case UPDATE_PHOTO_DESCRIPTION:
      // console.log("UPDATE_PHOTO_DESCRIPTION", action);
      newState = updatePhotoDescription(state, action);
      writeAnswers(newState);
      return newState;

    case SET_AUTH_STATE:
      // console.log("SET_AUTH_STATE");
      // Action handled in authReducer, but persist here
      writeAnswers(state);
      return state;

    default:
      // console.log("Unknown action: ", action);
      return state;
  }
}

function addPhoto(state, action) {
  // console.log("addPhoto", action.sectionId, action.questionId);
  const photoId = uuidv4();
  const result = { ...state };
  result.photoDetails = state.photoDetails ? { ...state.photoDetails } : {};
  result.photoDetails[photoId] = {
    description: "",
    sectionId: action.sectionId,
    questionId: action.questionId,
  };
  result.photos = state.photos ? { ...state.photos } : {};
  result.photos[photoId] = { imageData: action.imageData };
  return result;
}

export function loadPhoto(file, sectionId = null, questionId = null) {
  console.log("loadPhoto", sectionId, questionId);
  return function (dispatch) {
    return readFileAsync(file).then((data) => {
      dispatch({
        type: ADD_PHOTO,
        imageData: btoa(data),
        sectionId: sectionId,
        questionId: questionId,
      });
    });
  };
}

function readFileAsync(file) {
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
  console.log("deletePhoto", action);
  const result = { ...state };
  result.photoDetails = state.photoDetails ? { ...state.photoDetails } : {};
  delete result.photoDetails[action.photoId];
  result.photos = state.photos ? { ...state.photos } : {};
  delete result.photos[action.photoId];
  return result;
}

function updatePhotoDescription(state, action) {
  if (state.photoDetails === undefined) {
    return state;
  }
  const photoId = action.photoId;
  const photo = state.photoDetails[photoId];
  if (photo === undefined) {
    return state;
  }
  const result = { ...state, photoDetails: { ...state.photoDetails } };
  result.photoDetails[photoId] = { ...photo, description: action.description };
  return result;
}

export function refreshState() {
  return function (dispatch, getState) {
    return Promise.all([readAnswers(), readPhotos()])
      .then(([storedAnswers, storedPhotos]) => {
        const state = { ...getState(), initialisingState: false };
        if (storedAnswers === null) {
          writeAnswers(state).catch((err) => console.error(err));
        }
        if (storedPhotos === null) {
          writePhotos(state).catch((err) => console.error(err));
        }
        dispatch({
          type: REFRESH_STATE,
          state: {
            ...state,
            ...(storedAnswers !== null ? storedAnswers : {}),
            ...(storedPhotos !== null ? storedPhotos : {}),
          },
        });
      })
      .catch((err) => console.error(err));
  };
}

const writeAnswers = ({
  answers,
  answerCounts,
  photoDetails,
  hasSeenSplashPage,
  hasEverLoggedIn,
  initialisingState,
}) => {
  // console.log("writeAnswers");
  if (initialisingState) {
    console.log("Still initialisingState, skipping writeAnswers");
    return Promise.resolve();
  }
  return localforage.setItem("answers", {
    answers: answers,
    answerCounts: answerCounts,
    photoDetails: photoDetails,
    hasSeenSplashPage: hasSeenSplashPage,
    hasEverLoggedIn: hasEverLoggedIn,
  });
};
const readAnswers = () => localforage.getItem("answers");

const writePhotos = ({ photos, initialisingState }) => {
  // console.log("writePhotos");
  if (initialisingState) {
    console.log("Still initialisingState, skipping writePhotos");
    return Promise.resolve();
  }
  return localforage.setItem("photos", { photos: photos });
};
const readPhotos = () => localforage.getItem("photos");

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
  result.answers = { ...state.answers };
  result.answers[sectionId] = { ...state.answers[sectionId] };
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
  const FIELDNAMES = [
    "answer1",
    "answer2",
    "answer3",
    "year1",
    "year2",
    "year3",
  ];

  const previousValues = state.answers[sectionId][questionId];
  const answer = { ...state.answers[sectionId][questionId], [field]: value };
  const result = { ...state };
  result.answers = { ...result.answers };
  result.answers[sectionId] = { ...result.answers[sectionId] };
  result.answers[sectionId][questionId] = answer;

  const hasPreviousValue =
    FIELDNAMES.find(
      (fieldName) =>
        previousValues[fieldName] !== null &&
        previousValues[fieldName].length > 0
    ) !== undefined;
  const hasCurrentValue =
    FIELDNAMES.find(
      (fieldName) => answer[fieldName] !== null && answer[fieldName].length > 0
    ) !== undefined;

  if (hasPreviousValue !== hasCurrentValue) {
    result.answerCounts[sectionId] = { ...result.answerCounts[sectionId] };
    result.answerCounts[sectionId]["answer"] += hasCurrentValue ? 1 : -1;
  }
  return result;
}

// Exported for unit tests
export function surveyReducer(state = initialState(), action) {
  return surveyAnswersReducer(authReducer(state, action), action);
}

export default createStore(surveyReducer, applyMiddleware(thunk));
