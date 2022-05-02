import { REGISTER, SIGNED_IN } from "learning-play-audit-shared";
import {
  SectionAnswers,
  SurveyAnswerCounts,
  SurveyAnswers,
  SurveyStoreState,
} from "./SurveyModel";
import { INTRODUCTION } from "./SurveySections";

const SURVEY_ANSWERS: SurveyAnswers = {
  background: {
    contactname: { answer: "", comments: "" },
    localauthority: { answer: "", comments: "" },
    position: { answer: "", comments: "" },
    school: { answer: "", comments: "" },
    telephone: { answer: "", comments: "" },
  },
  community: {
    adultsoutside: { answer: "", comments: "" },
    childrenoutside: { answer: "", comments: "" },
    communityoutside: { answer: "", comments: "" },
    datedImprovements: {
      answer1: "",
      answer2: "",
      answer3: "",
      year1: "",
      year2: "",
      year3: "",
    },
    managegrowing: { answer: "", comments: "" },
    managelitter: { answer: "", comments: "" },
    manageother: { answer: "", comments: "" },
    othercommunity: { answer: "", comments: "" },
    parentsdesign: { answer: "", comments: "" },
    pupilsdesign: { answer: "", comments: "" },
    staffdesign: { answer: "", comments: "" },
  },
  greenspace: {
    accessible: { answer: "", comments: "" },
    changes: { answer: "", comments: "" },
    frequentuse: { answer: "", comments: "" },
    improveaccessible: { answer: "", comments: "" },
    improveteaching: { answer: "", comments: "" },
    improvewildlife: { answer: "", comments: "" },
    listowner: { answer: "", comments: "" },
    namegreenspace: { answer: "", comments: "" },
    teaching: { answer: "", comments: "" },
    wildlife: { answer: "", comments: "" },
  },
  learning: {
    RME: { answer: "", comments: "" },
    arts: { answer: "", comments: "" },
    classroom: { answer: "", comments: "" },
    disturbance: { answer: "", comments: "" },
    languages: { answer: "", comments: "" },
    maths: { answer: "", comments: "" },
    science: { answer: "", comments: "" },
    seating: { answer: "", comments: "" },
    sheltered: { answer: "", comments: "" },
    social: { answer: "", comments: "" },
    technologies: { answer: "", comments: "" },
  },
  play: {
    balancing: { answer: "", comments: "" },
    bark: { answer: "", comments: "" },
    bushes: { answer: "", comments: "" },
    climbing: { answer: "", comments: "" },
    den: { answer: "", comments: "" },
    grass: { answer: "", comments: "" },
    jumping: { answer: "", comments: "" },
    markings: { answer: "", comments: "" },
    physical: { answer: "", comments: "" },
    rocks: { answer: "", comments: "" },
    sand: { answer: "", comments: "" },
    slopes: { answer: "", comments: "" },
    soil: { answer: "", comments: "" },
    storage: { answer: "", comments: "" },
    straw: { answer: "", comments: "" },
    swinging: { answer: "", comments: "" },
    targets: { answer: "", comments: "" },
    trails: { answer: "", comments: "" },
    trunks: { answer: "", comments: "" },
    tyres: { answer: "", comments: "" },
    woodland: { answer: "", comments: "" },
  },
  practice: {
    allages: { answer: "", comments: "" },
    curriculumtopic: { answer: "", comments: "" },
    developingcurriculum: { answer: "", comments: "" },
    growfood: { answer: "", comments: "" },
    monitoring: { answer: "", comments: "" },
    oldersupervising: { answer: "", comments: "" },
    outcomes: { answer: "", comments: "" },
    outofsight: { answer: "", comments: "" },
    playpolicy: { answer: "", comments: "" },
    playrain: { answer: "", comments: "" },
    playsnow: { answer: "", comments: "" },
    principles: { answer: "", comments: "" },
    resources: { answer: "", comments: "" },
    skillstraining: { answer: "", comments: "" },
    typesofplay: { answer: "", comments: "" },
  },
  reflection: {
    CPD: { answer: "", comments: "" },
    groundsadvisor: { answer: "", comments: "" },
    ideas: { answer: "", comments: "" },
    onlineresources: { answer: "", comments: "" },
    straightforward: { answer: "", comments: "" },
  },
  sustainability: {
    airquality: { answer: "", comments: "" },
    birdboxes: { answer: "", comments: "" },
    bughotels: { answer: "", comments: "" },
    composting: { answer: "", comments: "" },
    cycle: { answer: "", comments: "" },
    deadwood: { answer: "", comments: "" },
    flowers: { answer: "", comments: "" },
    fruittrees: { answer: "", comments: "" },
    growingfood: { answer: "", comments: "" },
    heavyrain: { answer: "", comments: "" },
    litterbins: { answer: "", comments: "" },
    meadow: { answer: "", comments: "" },
    nature: { answer: "", comments: "" },
    overheating: { answer: "", comments: "" },
    ponds: { answer: "", comments: "" },
    renewableenergy: { answer: "", comments: "" },
    shrubs: { answer: "", comments: "" },
    trees: { answer: "", comments: "" },
  },
  wellbeing: {
    attractive: { answer: "", comments: "" },
    colourful: { answer: "", comments: "" },
    goodimpression: { answer: "", comments: "" },
    outdoorart: { answer: "", comments: "" },
    packedlunches: { answer: "", comments: "" },
    quiet: { answer: "", comments: "" },
    schoolmeals: { answer: "", comments: "" },
    seating: { answer: "", comments: "" },
    seatingsizes: { answer: "", comments: "" },
    shade: { answer: "", comments: "" },
    shelterrain: { answer: "", comments: "" },
    shelterwind: { answer: "", comments: "" },
    socialspaces: { answer: "", comments: "" },
  },
};

export const EMPTY_STATE: SurveyStoreState = {
  answerCounts: {
    background: { answer: 0, comments: 0 },
    community: { answer: 0, comments: 0 },
    greenspace: { answer: 0, comments: 0 },
    learning: { answer: 0, comments: 0 },
    play: { answer: 0, comments: 0 },
    practice: { answer: 0, comments: 0 },
    reflection: { answer: 0, comments: 0 },
    sustainability: { answer: 0, comments: 0 },
    wellbeing: { answer: 0, comments: 0 },
  },
  answers: {
    ...SURVEY_ANSWERS,
  },
  authState: REGISTER,
  errorMessage: "",
  hasEverLoggedIn: false,
  hasSeenSplashPage: false,
  initialisingState: true,
  photoDetails: {},
  photos: {},
  currentSectionId: INTRODUCTION,
  surveyVersion: "0.10.0",
};

export const INITIALISED_EMPTY_STATE = {
  ...EMPTY_STATE,
  initialisingState: false,
};

function createTestState(): SurveyStoreState {
  function populateAnswerCounts() {
    const result: SurveyAnswerCounts = {};
    Object.keys(EMPTY_STATE.answerCounts).forEach((item, i) => {
      result[item] = {
        answer: i,
        comments: i + 10,
      };
    });
    return result;
  }

  function populateSectionAnswers(section: SectionAnswers) {
    const result = { ...section };
    Object.keys(result).forEach((item, i) => {
      if (result[item].hasOwnProperty("answer")) {
        result[item] = {
          answer: "test " + item,
          comments: "test comment " + item,
        };
      } else {
        result[item] = {
          answer1: "test1 " + item,
          answer2: "test2 " + item,
          answer3: "test3 " + item,
          year1: "year1 " + item,
          year2: "year2 " + item,
          year3: "year3 " + item,
        };
      }
    });
    return result;
  }

  function populateAnswers() {
    const result = { ...EMPTY_STATE.answers };
    Object.keys(result).forEach((item) => {
      result[item] = populateSectionAnswers(result[item]);
    });
    return result;
  }

  return {
    ...EMPTY_STATE,
    answerCounts: populateAnswerCounts(),
    answers: populateAnswers(),
    hasEverLoggedIn: !EMPTY_STATE.hasEverLoggedIn,
    hasSeenSplashPage: !EMPTY_STATE.hasSeenSplashPage,
    initialisingState: false,
    authState: SIGNED_IN,
    errorMessage: "",
    surveyUser: { email: "test@example.com" },
    photos: {
      testPhotoId1: {
        imageData: Buffer.from("image data1").toString("base64"),
      },
      testPhotoId2: {
        imageData: Buffer.from("image data2").toString("base64"),
      },
      testPhotoId3: {
        imageData: Buffer.from("image data3").toString("base64"),
      },
    },
    photoDetails: {
      testPhotoId1: {
        description: "test photo1",
        sectionId: "wellbeing",
        questionId: "colourful",
      },
      testPhotoId2: {
        description: "test photo2",
        sectionId: "wellbeing",
        questionId: "colourful",
      },
      testPhotoId3: {
        description: "test photo3",
      },
    },
  };
}

export const INPUT_STATE = createTestState();
