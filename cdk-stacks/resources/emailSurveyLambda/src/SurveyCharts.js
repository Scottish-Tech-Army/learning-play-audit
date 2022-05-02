import {
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Chart,
} from "chart.js";
import {
  sectionsContent,
  SCALE_WITH_COMMENT,
} from "learning-play-audit-survey";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

// eslint-disable-next-line jest/require-hook
Chart.register(BarController, BarElement, CategoryScale, LinearScale);

function createAnswerWeights() {
  return sectionsContent.reduce((sections, section) => {
    var questions = {};
    sections[section.id] = questions;
    section.subsections.forEach((subsection) =>
      subsection.questions.forEach(
        ({ type, id, weight = 1 }) =>
          (questions[id] = type === SCALE_WITH_COMMENT ? weight : 0)
      )
    );
    return sections;
  }, {});
}
const answerWeights = createAnswerWeights();

const ANSWER_VALUES = { a: 1, b: 0.7, c: 0.3, d: 0 };

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

function getSingleAnswer(answers, answerWeights, sectionId, questionId) {
  const answer = answers[sectionId][questionId];
  const answerWeight = answerWeights[sectionId][questionId];
  var answerValue = 0;
  if (answer === null || answer === undefined) {
    throw new Error("Unknown question: " + sectionId + ":" + questionId);
  }
  if (
    answer.answer !== undefined &&
    ANSWER_VALUES[answer.answer] !== undefined
  ) {
    answerValue = ANSWER_VALUES[answer.answer];
  }
  return { value: answerValue * answerWeight, maxValue: answerWeight };
}

function calcMultipleAnswers(answers, answerWeights, sectionId, questionIds) {
  var totalValue = 0;
  var totalMaxValue = 0;
  questionIds.forEach((questionId) => {
    const { value, maxValue } = getSingleAnswer(
      answers,
      answerWeights,
      sectionId,
      questionId
    );
    totalValue += value;
    totalMaxValue += maxValue;
  });
  return (totalValue * 100) / totalMaxValue;
}

function calcSectionAnswers(answers, answerWeights, sectionId) {
  const questionIds = Object.keys(answers[sectionId]);
  return calcMultipleAnswers(answers, answerWeights, sectionId, questionIds);
}

function calcAnswer(answers, answerWeights, sectionId, questionId) {
  const { value, maxValue } = getSingleAnswer(
    answers,
    answerWeights,
    sectionId,
    questionId
  );
  return (value * 100) / maxValue;
}

function chartDataGreenspaceAnswers(answers) {
  return [
    calcAnswer(answers, answerWeights, "greenspace", "accessible"),
    calcAnswer(answers, answerWeights, "greenspace", "frequentuse"),
    calcAnswer(answers, answerWeights, "greenspace", "wildlife"),
    calcAnswer(answers, answerWeights, "greenspace", "teaching"),
    calcAnswer(answers, answerWeights, "greenspace", "changes"),
  ];
}

function chartDataAnswers(answers) {
  return [
    calcSectionAnswers(answers, answerWeights, "learning"),
    calcSectionAnswers(answers, answerWeights, "play"),
    calcSectionAnswers(answers, answerWeights, "wellbeing"),
    calcSectionAnswers(answers, answerWeights, "sustainability"),
    calcSectionAnswers(answers, answerWeights, "community"),
  ];
}

function chartDataPracticeAnswers(answers) {
  return [
    calcMultipleAnswers(answers, answerWeights, "practice", [
      "developingcurriculum",
      "curriculumtopic",
      "resources",
      "outcomes",
      "principles",
      "growfood",
    ]),
    calcMultipleAnswers(answers, answerWeights, "practice", [
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

function getChartConfiguration(labels, data, barColour) {
  const valueAxis = {
    type: "linear",
    grid: { color: "#807d7d", z: 1 },
    min: 0,
    max: 100,
    ticks: {
      beginAtZero: true,
      fontSize: 14,
    },
  };

  const categoryAxis = {
    type: "category",
    grid: {
      color: "#807d7d",
      z: 1,
    },
    ticks: {
      fontSize: 16,
      fontStyle: "bold",
    },
  };

  return {
    type: "bar",
    options: {
      plugins: {
        legend: { display: false },
      },
      borderWidth: 10,
      scales: {
        x: valueAxis,
        y: categoryAxis,
      },
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

export async function getCharts(answers) {
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
