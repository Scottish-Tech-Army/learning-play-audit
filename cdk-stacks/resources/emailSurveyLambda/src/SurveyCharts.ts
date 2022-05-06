import {
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Chart,
  ChartConfiguration,
  ScaleOptions,
} from "chart.js";
import {
  sectionsContent,
  SCALE_WITH_COMMENT,
} from "learning-play-audit-survey";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { AnswerWeights, QuestionAnswer, SurveyAnswers } from "./SurveyModel";

// eslint-disable-next-line jest/require-hook
Chart.register(BarController, BarElement, CategoryScale, LinearScale);

function createAnswerWeights() {
  return sectionsContent.reduce((sections, section) => {
    var questions: Record<string, number> = {};
    sections[section.id] = questions;
    section.subsections.forEach((subsection) =>
      subsection.questions.forEach(
        ({ type, id, weight = 1 }) =>
          (questions[id] = type === SCALE_WITH_COMMENT ? weight : 0)
      )
    );
    return sections;
  }, {} as AnswerWeights);
}
const answerWeights = createAnswerWeights();

const ANSWER_VALUES: Record<string, number> = { a: 1, b: 0.7, c: 0.3, d: 0 };

const width = 600; //px
const backgroundColour = "white";
const largeChartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height: 300,
  backgroundColour,
});
const smallChartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height: 150,
  backgroundColour,
});

function getSingleAnswer(
  answers: SurveyAnswers,
  sectionId: string,
  questionId: string
) {
  var answerValue = 0;
  if (!answers[sectionId][questionId]) {
    throw new Error("Unknown question: " + sectionId + ":" + questionId);
  }
  const answer = answers[sectionId][questionId] as QuestionAnswer;
  const answerWeight = answerWeights[sectionId][questionId];
  if (
    answer.answer !== undefined &&
    ANSWER_VALUES[answer.answer] !== undefined
  ) {
    answerValue = ANSWER_VALUES[answer.answer];
  }
  return { value: answerValue * answerWeight, maxValue: answerWeight };
}

function calcMultipleAnswers(
  answers: SurveyAnswers,
  sectionId: string,
  questionIds: string[]
) {
  var totalValue = 0;
  var totalMaxValue = 0;
  questionIds.forEach((questionId) => {
    const { value, maxValue } = getSingleAnswer(answers, sectionId, questionId);
    totalValue += value;
    totalMaxValue += maxValue;
  });
  return (totalValue * 100) / totalMaxValue;
}

function calcSectionAnswers(answers: SurveyAnswers, sectionId: string) {
  const questionIds = Object.keys(answers[sectionId]);
  return calcMultipleAnswers(answers, sectionId, questionIds);
}

function calcAnswer(
  answers: SurveyAnswers,
  sectionId: string,
  questionId: string
) {
  const { value, maxValue } = getSingleAnswer(answers, sectionId, questionId);
  return (value * 100) / maxValue;
}

function chartDataGreenspaceAnswers(answers: SurveyAnswers) {
  return [
    calcAnswer(answers, "greenspace", "accessible"),
    calcAnswer(answers, "greenspace", "frequentuse"),
    calcAnswer(answers, "greenspace", "wildlife"),
    calcAnswer(answers, "greenspace", "teaching"),
    calcAnswer(answers, "greenspace", "changes"),
  ];
}

function chartDataAnswers(answers: SurveyAnswers) {
  return [
    calcSectionAnswers(answers, "learning"),
    calcSectionAnswers(answers, "play"),
    calcSectionAnswers(answers, "wellbeing"),
    calcSectionAnswers(answers, "sustainability"),
    calcSectionAnswers(answers, "community"),
  ];
}

function chartDataPracticeAnswers(answers: SurveyAnswers) {
  return [
    calcMultipleAnswers(answers, "practice", [
      "developingcurriculum",
      "curriculumtopic",
      "resources",
      "outcomes",
      "principles",
      "growfood",
    ]),
    calcMultipleAnswers(answers, "practice", [
      "playpolicy",
      "playrain",
      "playsnow",
      "allages",
      "outofsight",
      "typesofplay",
      "monitoring",
      "skillstraining",
      "oldersupervising",
    ]),
  ];
}

function getChartConfiguration(
  labels: (string | string[])[],
  data: number[],
  barColour: string
): ChartConfiguration {
  const valueAxis: ScaleOptions = {
    type: "linear",
    grid: { color: "#807d7d", z: 1 },
    min: 0,
    max: 100,
    beginAtZero: true,
    ticks: { font: { size: 14 } },
  };

  const categoryAxis: ScaleOptions = {
    type: "category",
    grid: { color: "#807d7d", z: 1 },
    ticks: { font: { size: 16, weight: "bold" } },
  };

  return {
    type: "bar",
    options: {
      plugins: { legend: { display: false } },
      layout: { padding: 10 },
      scales: { x: valueAxis, y: categoryAxis },
      indexAxis: "y",
    },
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: barColour,
          borderColor: barColour,
          hoverBackgroundColor: barColour,
          hoverBorderColor: barColour,
          categoryPercentage: 0.9,
          maxBarThickness: 55,
        },
      ],
    },
  };
}

export async function getCharts(answers: SurveyAnswers) {
  const learningChart = await largeChartJSNodeCanvas.renderToBuffer(
    getChartConfiguration(
      [
        "For Learning",
        "For Play",
        "For Wellbeing",
        "For Sustainability",
        ["For Community", "& Participation"],
      ],
      chartDataAnswers(answers),
      "#2d6a89"
    )
  );

  const greenspaceChart = await largeChartJSNodeCanvas.renderToBuffer(
    getChartConfiguration(
      [
        "For Accessibility",
        "For Frequent Use",
        "For Wildlife",
        ["For Learning", "& Play"],
        ["For Ease of", "Change"],
      ],
      chartDataGreenspaceAnswers(answers),
      "#2d6a89"
    )
  );

  const practiceChart = await smallChartJSNodeCanvas.renderToBuffer(
    getChartConfiguration(
      ["Learning", "Play"],
      chartDataPracticeAnswers(answers),
      "#2d6a89"
    )
  );

  return { learningChart, greenspaceChart, practiceChart };
}
