import { surveyReducer, refreshState, loadPhoto } from "./SurveyModel.js";
import configureStore from "redux-mock-store";
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
  CONFIRM_WELCOME,
} from "./ActionTypes.js";
import { SIGNED_IN, SIGN_IN } from "./AuthStates";
import rfdc from "rfdc";
// local forage is mocked in setupTests.js
import localforage from "localforage";
import { EMPTY_STATE, INITIALISED_EMPTY_STATE, INPUT_STATE } from "./TestUtils";

const FIXED_UUID = "00000000-0000-0000-0000-000000000000";

jest.mock("uuid", () => ({ v4: () => "00000000-0000-0000-0000-000000000000" }));

const clone = rfdc();

test("localforage configuration", () => {
  expect(localforage.config).toHaveBeenCalledWith({
    description: "survey answers",
    name: "learning-play-audit",
    storeName: "surveyanswers",
    version: 1,
  });
});

describe("surveyReducer", () => {
  beforeEach(() => {
    // localforage.config.mockClear();
  });

  it("initial state - empty", () => {
    expect(surveyReducer(undefined, {})).toStrictEqual(EMPTY_STATE);
  });

  it("action RESET_STATE", () => {
    expect(
      surveyReducer(INPUT_STATE, {
        type: RESET_STATE,
      })
    ).toStrictEqual({ ...EMPTY_STATE, initialisingState: false });
  });

  it("action REFRESH_STATE", () => {
    expect(
      surveyReducer(EMPTY_STATE, {
        type: REFRESH_STATE,
        state: INPUT_STATE,
      })
    ).toStrictEqual(INPUT_STATE);

    expect(
      surveyReducer(INPUT_STATE, {
        type: REFRESH_STATE,
        state: EMPTY_STATE,
      })
    ).toStrictEqual(EMPTY_STATE);
  });

  it("action CONFIRM_WELCOME", () => {
    const inputState = {
      ...INITIALISED_EMPTY_STATE,
      hasSeenSplashPage: false,
      hasEverLoggedIn: false,
    };

    expect(
      surveyReducer(inputState, {
        type: CONFIRM_WELCOME,
      })
    ).toStrictEqual({
      ...inputState,
      hasEverLoggedIn: true,
      hasSeenSplashPage: true,
    });

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: EMPTY_STATE.answerCounts,
      answers: EMPTY_STATE.answers,
      hasEverLoggedIn: true,
      hasSeenSplashPage: true,
      photoDetails: EMPTY_STATE.photoDetails,
    });
  });

  it("action SET_AUTH_ERROR", () => {
    expect(
      surveyReducer(STATE_WITHOUT_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "new error",
      })
    ).toStrictEqual(STATE_WITH_AUTH_ERROR);

    expect(
      surveyReducer(STATE_WITH_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "",
      })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);

    expect(
      surveyReducer(STATE_WITH_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "new error",
      })
    ).toStrictEqual(STATE_WITH_AUTH_ERROR);
  });

  it("action CLEAR_AUTH_ERROR", () => {
    expect(
      surveyReducer(STATE_WITH_AUTH_ERROR, { type: CLEAR_AUTH_ERROR })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);

    expect(
      surveyReducer(STATE_WITHOUT_AUTH_ERROR, { type: CLEAR_AUTH_ERROR })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);
  });

  it("action SET_AUTH_STATE", () => {
    expect(
      surveyReducer(
        {
          ...INPUT_STATE,
          authentication: {
            errorMessage: "new error",
            state: SIGN_IN,
            user: "test user",
          },
          hasSeenSplashPage: true,
          hasEverLoggedIn: false,
        },
        {
          type: SET_AUTH_STATE,
          authState: "new auth state",
          user: "new user",
        }
      )
    ).toStrictEqual({
      ...INPUT_STATE,
      authentication: {
        errorMessage: "",
        state: "new auth state",
        user: "new user",
      },
      hasSeenSplashPage: true,
      hasEverLoggedIn: false,
    });

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: false,
      hasSeenSplashPage: true,
      photoDetails: INPUT_STATE.photoDetails,
    });
  });

  it("action SET_AUTH_STATE SIGNED_IN triggers flags", () => {
    expect(
      surveyReducer(
        {
          ...INPUT_STATE,
          authentication: {
            errorMessage: "new error",
            state: SIGN_IN,
            user: "test user",
          },
          hasSeenSplashPage: true,
          hasEverLoggedIn: false,
        },
        {
          type: SET_AUTH_STATE,
          authState: SIGNED_IN,
          user: "new user",
        }
      )
    ).toStrictEqual({
      ...INPUT_STATE,
      authentication: {
        errorMessage: "",
        state: SIGNED_IN,
        user: "new user",
      },
      hasSeenSplashPage: false,
      hasEverLoggedIn: false,
    });

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: false,
      hasSeenSplashPage: false,
      photoDetails: INPUT_STATE.photoDetails,
    });
  });

  it("action SET_AUTH_STATE authState undefined", () => {
    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_AUTH_STATE,
        user: "new user",
      })
    ).toStrictEqual(INPUT_STATE);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
      hasSeenSplashPage: INPUT_STATE.hasSeenSplashPage,
      photoDetails: INPUT_STATE.photoDetails,
    });
  });

  it("action SET_ANSWER set answer", () => {
    const expectedState = clone(INPUT_STATE);
    expectedState.answers.wellbeing.outdoorart.answer = "new answer";

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "wellbeing",
        questionId: "outdoorart",
        field: "answer",
        value: "new answer",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
  });

  it("action SET_ANSWER set comment", () => {
    const expectedState = clone(INPUT_STATE);
    expectedState.answers.wellbeing.outdoorart.comments = "new comment";

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "wellbeing",
        questionId: "outdoorart",
        field: "comments",
        value: "new comment",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
  });

  it("action SET_ANSWER clear answer", () => {
    const expectedState = clone(INPUT_STATE);
    expectedState.answers.wellbeing.outdoorart.answer = "";
    expectedState.answerCounts.wellbeing.answer =
      expectedState.answerCounts.wellbeing.answer - 1;

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "wellbeing",
        questionId: "outdoorart",
        field: "answer",
        value: "",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
  });

  it("action SET_ANSWER clear comment", () => {
    const expectedState = clone(INPUT_STATE);
    expectedState.answers.wellbeing.outdoorart.comments = "";
    expectedState.answerCounts.wellbeing.comments =
      expectedState.answerCounts.wellbeing.comments - 1;

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "wellbeing",
        questionId: "outdoorart",
        field: "comments",
        value: "",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
  });

  it("action SET_ANSWER add answer", () => {
    const expectedState = clone(INITIALISED_EMPTY_STATE);
    expectedState.answers.wellbeing.outdoorart.answer = "added answer";
    expectedState.answerCounts.wellbeing.answer =
      expectedState.answerCounts.wellbeing.answer + 1;

    expect(
      surveyReducer(INITIALISED_EMPTY_STATE, {
        type: SET_ANSWER,
        sectionId: "wellbeing",
        questionId: "outdoorart",
        field: "answer",
        value: "added answer",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
  });

  it("action SET_ANSWER add comment", () => {
    const expectedState = clone(INITIALISED_EMPTY_STATE);
    expectedState.answers.wellbeing.outdoorart.comments = "added comment";
    expectedState.answerCounts.wellbeing.comments =
      expectedState.answerCounts.wellbeing.comments + 1;

    expect(
      surveyReducer(INITIALISED_EMPTY_STATE, {
        type: SET_ANSWER,
        sectionId: "wellbeing",
        questionId: "outdoorart",
        field: "comments",
        value: "added comment",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
  });

  it("action SET_ANSWER set datedImprovements answer", () => {
    const expectedState = clone(INPUT_STATE);
    expectedState.answers.community.datedImprovements.answer1 = "new answer";

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "community",
        questionId: "datedImprovements",
        field: "answer1",
        value: "new answer",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
  });

  it("action SET_ANSWER clear datedImprovements answer", () => {
    const expectedState = clone(INPUT_STATE);
    expectedState.answers.community.datedImprovements.year2 = "";

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "community",
        questionId: "datedImprovements",
        field: "year2",
        value: "",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
  });

  it("action SET_ANSWER clear datedImprovements answer completely", () => {
    const inputState = clone(INPUT_STATE);
    // clear all but one
    inputState.answers.community.datedImprovements.answer1 = "";
    inputState.answers.community.datedImprovements.answer2 = "";
    inputState.answers.community.datedImprovements.answer3 = "";
    inputState.answers.community.datedImprovements.year1 = "";
    inputState.answers.community.datedImprovements.year3 = "";

    const expectedState = clone(inputState);
    expectedState.answers.community.datedImprovements.year2 = "";
    expectedState.answerCounts.community.answer =
      expectedState.answerCounts.community.answer - 1;

    expect(
      surveyReducer(inputState, {
        type: SET_ANSWER,
        sectionId: "community",
        questionId: "datedImprovements",
        field: "year2",
        value: "",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
  });

  it("action SET_ANSWER add datedImprovements answer", () => {
    const expectedState = clone(INITIALISED_EMPTY_STATE);
    expectedState.answers.community.datedImprovements.answer3 = "added answer";
    expectedState.answerCounts.community.answer =
      expectedState.answerCounts.community.answer + 1;

    expect(
      surveyReducer(INITIALISED_EMPTY_STATE, {
        type: SET_ANSWER,
        sectionId: "community",
        questionId: "datedImprovements",
        field: "answer3",
        value: "added answer",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
  });

  it("action ADD_PHOTO", () => {
    const expectedState = clone(INPUT_STATE);
    expectedState.photoDetails[FIXED_UUID] = {
      description: "",
      sectionId: "community",
      questionId: "datedImprovements",
    };
    expectedState.photos[FIXED_UUID] = {
      imageData: "new imageData",
    };

    expect(
      surveyReducer(INPUT_STATE, {
        type: ADD_PHOTO,
        sectionId: "community",
        questionId: "datedImprovements",
        imageData: "new imageData",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: expectedState.photos,
    });
  });

  it("action ADD_PHOTO first photo", () => {
    const expectedState = clone(INITIALISED_EMPTY_STATE);
    expectedState.photoDetails[FIXED_UUID] = {
      description: "",
      sectionId: "community",
      questionId: "datedImprovements",
    };
    expectedState.photos[FIXED_UUID] = {
      imageData: "new imageData",
    };

    expect(
      surveyReducer(INITIALISED_EMPTY_STATE, {
        type: ADD_PHOTO,
        sectionId: "community",
        questionId: "datedImprovements",
        imageData: "new imageData",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: expectedState.photos,
    });
  });

  it("action ADD_PHOTO photo state undefined", () => {
    const expectedState = clone(INITIALISED_EMPTY_STATE);
    expectedState.photoDetails[FIXED_UUID] = {
      description: "",
      sectionId: "community",
      questionId: "datedImprovements",
    };
    expectedState.photos[FIXED_UUID] = {
      imageData: "new imageData",
    };

    expect(
      surveyReducer(PARTIAL_EMPTY_STATE, {
        type: ADD_PHOTO,
        sectionId: "community",
        questionId: "datedImprovements",
        imageData: "new imageData",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: expectedState.photos,
    });
  });

  it("action ADD_PHOTO not question specific", () => {
    const expectedState = clone(INPUT_STATE);
    expectedState.photoDetails[FIXED_UUID] = {
      description: "",
      sectionId: undefined,
      questionId: undefined,
    };
    expectedState.photos[FIXED_UUID] = {
      imageData: "new imageData",
    };

    expect(
      surveyReducer(INPUT_STATE, {
        type: ADD_PHOTO,
        imageData: "new imageData",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: expectedState.photos,
    });
  });

  it("action DELETE_PHOTO", () => {
    const inputState = clone(INPUT_STATE);
    inputState.photoDetails[FIXED_UUID] = {
      description: "",
      sectionId: "community",
      questionId: "datedImprovements",
    };
    inputState.photos[FIXED_UUID] = {
      imageData: "new imageData",
    };

    const expectedState = clone(INPUT_STATE);

    expect(
      surveyReducer(inputState, {
        type: DELETE_PHOTO,
        photoId: FIXED_UUID,
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: expectedState.photos,
    });
  });

  it("action DELETE_PHOTO photo not found", () => {
    expect(
      surveyReducer(clone(INPUT_STATE), {
        type: DELETE_PHOTO,
        photoId: FIXED_UUID,
      })
    ).toStrictEqual(INPUT_STATE);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
      hasSeenSplashPage: INPUT_STATE.hasSeenSplashPage,
      photoDetails: INPUT_STATE.photoDetails,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: INPUT_STATE.photos,
    });
  });

  it("action DELETE_PHOTO photo state undefined", () => {
    expect(
      surveyReducer(clone(PARTIAL_EMPTY_STATE), {
        type: DELETE_PHOTO,
        photoId: FIXED_UUID,
      })
    ).toStrictEqual(INITIALISED_EMPTY_STATE);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INITIALISED_EMPTY_STATE.answerCounts,
      answers: INITIALISED_EMPTY_STATE.answers,
      hasEverLoggedIn: INITIALISED_EMPTY_STATE.hasEverLoggedIn,
      hasSeenSplashPage: INITIALISED_EMPTY_STATE.hasSeenSplashPage,
      photoDetails: INITIALISED_EMPTY_STATE.photoDetails,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: INITIALISED_EMPTY_STATE.photos,
    });
  });

  it("action UPDATE_PHOTO_DESCRIPTION", () => {
    const inputState = clone(INPUT_STATE);
    inputState.photoDetails[FIXED_UUID] = {
      description: "",
      sectionId: "community",
      questionId: "datedImprovements",
    };
    inputState.photos[FIXED_UUID] = {
      imageData: "new imageData",
    };

    const expectedState = clone(inputState);
    expectedState.photoDetails[FIXED_UUID].description = "new description";

    expect(
      surveyReducer(inputState, {
        type: UPDATE_PHOTO_DESCRIPTION,
        photoId: FIXED_UUID,
        description: "new description",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
    });
  });

  it("action UPDATE_PHOTO_DESCRIPTION photo not found", () => {
    expect(
      surveyReducer(clone(INPUT_STATE), {
        type: UPDATE_PHOTO_DESCRIPTION,
        photoId: FIXED_UUID,
        description: "new description",
      })
    ).toStrictEqual(INPUT_STATE);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
      hasSeenSplashPage: INPUT_STATE.hasSeenSplashPage,
      photoDetails: INPUT_STATE.photoDetails,
    });
  });
});

describe("surveyReducer actions pre-initialisation should not write to storage", () => {
  it("action CONFIRM_WELCOME", () => {
    const inputState = {
      ...EMPTY_STATE,
      initialisingState: true,
      hasSeenSplashPage: false,
    };

    expect(
      surveyReducer(inputState, {
        type: CONFIRM_WELCOME,
      })
    ).toStrictEqual({
      ...EMPTY_STATE,
      hasSeenSplashPage: true,
      hasEverLoggedIn: true,
    });

    // Check calls
    expect(localforage.setItem).not.toHaveBeenCalled();
  });

  it("action ADD_PHOTO", () => {
    const inputState = {
      ...INPUT_STATE,
      initialisingState: true,
    };

    const expectedState = clone(inputState);
    expectedState.photoDetails[FIXED_UUID] = {
      description: "",
      sectionId: "community",
      questionId: "datedImprovements",
    };
    expectedState.photos[FIXED_UUID] = {
      imageData: "new imageData",
    };

    expect(
      surveyReducer(inputState, {
        type: ADD_PHOTO,
        sectionId: "community",
        questionId: "datedImprovements",
        imageData: "new imageData",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).not.toHaveBeenCalled();
  });
});

describe("refreshState", () => {
  const STORED_ANSWERS = {
    answers: "stored answers",
    answerCounts: "stored answerCounts",
    photoDetails: "stored photoDetails",
    hasSeenSplashPage: "stored hasSeenSplashPage",
    hasEverLoggedIn: "stored hasEverLoggedIn",
  };

  const STORED_PHOTOS = {
    photos: "stored photos",
  };

  function mockLocalForageGetItem(answers, photos) {
    localforage.getItem.mockImplementation((itemId) => {
      if (itemId === "answers") {
        return Promise.resolve(answers);
      }
      if (itemId === "photos") {
        return Promise.resolve(photos);
      }
      return Promise.reject(new Error("Unexpected getItem " + itemId));
    });
  }

  it("stored answers and photos", async () => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const store = mockStore(INPUT_STATE);

    mockLocalForageGetItem(STORED_ANSWERS, STORED_PHOTOS);

    await store.dispatch(refreshState()).then(() => {
      expect(store.getActions()).toStrictEqual([
        {
          type: REFRESH_STATE,
          state: {
            answerCounts: "stored answerCounts",
            answers: "stored answers",
            authentication: INPUT_STATE.authentication,
            hasEverLoggedIn: "stored hasEverLoggedIn",
            hasSeenSplashPage: "stored hasSeenSplashPage",
            initialisingState: false,
            photoDetails: "stored photoDetails",
            photos: "stored photos",
          },
        },
      ]);

      // Check calls
      expect(localforage.getItem).toHaveBeenCalledTimes(2);
      expect(localforage.getItem).toHaveBeenCalledWith("answers");
      expect(localforage.getItem).toHaveBeenCalledWith("photos");
    });
  });

  it("stored answers only", async () => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const store = mockStore(INPUT_STATE);

    mockLocalForageGetItem(STORED_ANSWERS, null);

    await store.dispatch(refreshState()).then(() => {
      expect(store.getActions()).toStrictEqual([
        {
          type: REFRESH_STATE,
          state: {
            answerCounts: "stored answerCounts",
            answers: "stored answers",
            authentication: INPUT_STATE.authentication,
            hasEverLoggedIn: "stored hasEverLoggedIn",
            hasSeenSplashPage: "stored hasSeenSplashPage",
            initialisingState: false,
            photoDetails: "stored photoDetails",
            photos: INPUT_STATE.photos,
          },
        },
      ]);

      // Check calls
      expect(localforage.getItem).toHaveBeenCalledTimes(2);
      expect(localforage.getItem).toHaveBeenCalledWith("answers");
      expect(localforage.getItem).toHaveBeenCalledWith("photos");
      expect(localforage.setItem).toHaveBeenCalledTimes(1);
      expect(localforage.setItem).toHaveBeenCalledWith("photos", {
        photos: INPUT_STATE.photos,
      });
    });
  });

  it("stored photos only", async () => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const store = mockStore(INPUT_STATE);

    mockLocalForageGetItem(null, STORED_PHOTOS);

    await store.dispatch(refreshState()).then(() => {
      expect(store.getActions()).toStrictEqual([
        {
          type: REFRESH_STATE,
          state: {
            ...INPUT_STATE,
            initialisingState: false,
            photos: "stored photos",
          },
        },
      ]);

      // Check calls
      expect(localforage.getItem).toHaveBeenCalledTimes(2);
      expect(localforage.getItem).toHaveBeenCalledWith("answers");
      expect(localforage.getItem).toHaveBeenCalledWith("photos");
      expect(localforage.setItem).toHaveBeenCalledTimes(1);
      expect(localforage.setItem).toHaveBeenCalledWith("answers", {
        answerCounts: INPUT_STATE.answerCounts,
        answers: INPUT_STATE.answers,
        hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
        hasSeenSplashPage: INPUT_STATE.hasEverLoggedIn,
        photoDetails: INPUT_STATE.photoDetails,
      });
    });
  });

  it("nothing stored", async () => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const store = mockStore(INPUT_STATE);

    mockLocalForageGetItem(null, null);

    await store.dispatch(refreshState()).then(() => {
      expect(store.getActions()).toStrictEqual([
        {
          type: REFRESH_STATE,
          state: {
            ...INPUT_STATE,
            initialisingState: false,
          },
        },
      ]);

      // Check calls
      expect(localforage.getItem).toHaveBeenCalledTimes(2);
      expect(localforage.getItem).toHaveBeenCalledWith("answers");
      expect(localforage.getItem).toHaveBeenCalledWith("photos");
      expect(localforage.setItem).toHaveBeenCalledTimes(2);
      expect(localforage.setItem).toHaveBeenCalledWith("answers", {
        answerCounts: INPUT_STATE.answerCounts,
        answers: INPUT_STATE.answers,
        hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
        hasSeenSplashPage: INPUT_STATE.hasEverLoggedIn,
        photoDetails: INPUT_STATE.photoDetails,
      });
      expect(localforage.setItem).toHaveBeenCalledWith("photos", {
        photos: INPUT_STATE.photos,
      });
    });
  });

  it("read failed - don't refresh state", async () => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const store = mockStore(INPUT_STATE);

    localforage.getItem.mockImplementation((itemId) => {
      return Promise.reject(new Error("GetItem failed " + itemId));
    });

    await store.dispatch(refreshState()).then(() => {
      expect(store.getActions()).toStrictEqual([]);

      // Check calls
      expect(localforage.getItem).toHaveBeenCalledTimes(2);
      expect(localforage.getItem).toHaveBeenCalledWith("answers");
      expect(localforage.getItem).toHaveBeenCalledWith("photos");
      expect(localforage.setItem).not.toHaveBeenCalled();
    });
  });

  it("write failed - continue to refresh state", async () => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const store = mockStore(INPUT_STATE);

    mockLocalForageGetItem(null, null);

    localforage.setItem.mockImplementation((itemId, value) => {
      return Promise.reject(new Error("SetItem failed " + itemId));
    });

    await store.dispatch(refreshState()).then(() => {
      expect(store.getActions()).toStrictEqual([
        {
          type: REFRESH_STATE,
          state: {
            ...INPUT_STATE,
            initialisingState: false,
          },
        },
      ]);

      // Check calls
      expect(localforage.getItem).toHaveBeenCalledTimes(2);
      expect(localforage.getItem).toHaveBeenCalledWith("answers");
      expect(localforage.getItem).toHaveBeenCalledWith("photos");
      expect(localforage.setItem).toHaveBeenCalledTimes(2);
      expect(localforage.setItem).toHaveBeenCalledWith("answers", {
        answerCounts: INPUT_STATE.answerCounts,
        answers: INPUT_STATE.answers,
        hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
        hasSeenSplashPage: INPUT_STATE.hasEverLoggedIn,
        photoDetails: INPUT_STATE.photoDetails,
      });
      expect(localforage.setItem).toHaveBeenCalledWith("photos", {
        photos: INPUT_STATE.photos,
      });
    });
  });
});

describe("loadPhoto", () => {
  const IMAGEDATA = "test image data";
  const IMAGEDATA_BASE64 = btoa(IMAGEDATA);
  const INPUT_FILE = new Blob([IMAGEDATA], { type: "mimeType" });

  const middlewares = [thunk];
  const mockStore = configureStore(middlewares);

  it("load for question", async () => {
    const store = mockStore(INPUT_STATE);

    const expectedActions = [
      {
        type: ADD_PHOTO,
        imageData: IMAGEDATA_BASE64,
        sectionId: "community",
        questionId: "communityoutside",
      },
    ];
    await store
      .dispatch(loadPhoto(INPUT_FILE, "community", "communityoutside"))
      .then(() => {
        expect(store.getActions()).toStrictEqual(expectedActions);
      });
  });

  it("load general", async () => {
    const store = mockStore(INPUT_STATE);

    const expectedActions = [
      {
        type: ADD_PHOTO,
        imageData: IMAGEDATA_BASE64,
        questionId: null,
        sectionId: null,
      },
    ];
    await store.dispatch(loadPhoto(INPUT_FILE)).then(() => {
      expect(store.getActions()).toStrictEqual(expectedActions);
    });
  });

  it("bad file", async () => {
    const store = mockStore(INPUT_STATE);

    await store.dispatch(loadPhoto("notAFile")).catch((err) => {
      expect(err.message).toContain(
        "Failed to execute 'readAsBinaryString' on 'FileReader'"
      );
    });
  });
});

// To handle test branches where photo state is undefined
const PARTIAL_EMPTY_STATE = { ...EMPTY_STATE, initialisingState: false };
delete PARTIAL_EMPTY_STATE.photoDetails;
delete PARTIAL_EMPTY_STATE.photos;

const STATE_WITH_AUTH_ERROR = {
  ...INPUT_STATE,
  authentication: {
    errorMessage: "new error",
    state: SIGN_IN,
    user: "test user",
  },
};

const STATE_WITHOUT_AUTH_ERROR = {
  ...INPUT_STATE,
  authentication: { errorMessage: "", state: SIGN_IN, user: "test user" },
};
