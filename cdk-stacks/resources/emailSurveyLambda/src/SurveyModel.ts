import { OutputInfo } from "sharp";

export type QuestionAnswer = {
  answer: string;
  comments: string;
};

export type DatedQuestionAnswer = {
  answer1: string;
  year1: string;
  answer2: string;
  year2: string;
  answer3: string;
  year3: string;
};

export type QuestionAnswerKey = keyof QuestionAnswer;
export type DatedQuestionAnswerKey = keyof DatedQuestionAnswer;

export type SectionAnswers = Record<
  string,
  QuestionAnswer | DatedQuestionAnswer
>;

export type SurveyAnswers = Record<string, SectionAnswers>;

export interface SectionAnswerCount {
  answer: number;
  comments: number;
}

export type SurveyAnswerCounts = Record<string, SectionAnswerCount>;

export interface PhotoDetails {
  description: string;
  sectionId?: string;
  questionId?: string;
}

export interface Photo {
  imageData: string;
}

export interface PhotoDetails {
  bucket: string;
  description: string;
  fullsize: {
    height: number;
    key: string;
    uploadKey: string | null;
    width: number;
  };
}

export type PhotosData = Record<string, { data: Buffer; info: OutputInfo }>

export type AnswerWeights = Record<string, Record<string, number>>;

export interface SurveyResponse {
  __typename: "SurveyResponse";
  createdAt: string;
  id: string;
  photos: PhotoDetails[];
  responderEmail: string;
  responderName: string;
  schoolName: string;
  state: string;
  surveyResponse: SurveyAnswers;
  surveyVersion: string;
  updatedAt: string;
}