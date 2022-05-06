import React, { useRef, useEffect, MutableRefObject, useState } from "react";
import "../App.css";
import { useSelector } from "react-redux";
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
  SCALE_WITH_COMMENT,
  sectionQuestions,
  sectionsContent,
} from "learning-play-audit-survey";
import SectionBottomNavigation from "./SectionBottomNavigation";
import {
  getAnswers,
  QuestionAnswer,
} from "../model/SurveyModel";

// eslint-disable-next-line jest/require-hook
Chart.register(BarController, BarElement, CategoryScale, LinearScale);

const ANSWER_VALUES = { a: 1, b: 0.7, c: 0.3, d: 0 };
type ANSWER_VALUE_KEY = keyof typeof ANSWER_VALUES;

function ResultsSection() {
  const answers = useSelector(getAnswers);
  const chartContainer1small = useRef<HTMLCanvasElement | null>(null);
  const chartContainer1large = useRef<HTMLCanvasElement | null>(null);
  const chartContainer2small = useRef<HTMLCanvasElement | null>(null);
  const chartContainer2large = useRef<HTMLCanvasElement | null>(null);
  const chartContainer3small = useRef<HTMLCanvasElement | null>(null);
  const chartContainer3large = useRef<HTMLCanvasElement | null>(null);
  const chartInstance1small = useRef<Chart | null>(null);
  const chartInstance1large = useRef<Chart | null>(null);
  const chartInstance2small = useRef<Chart | null>(null);
  const chartInstance2large = useRef<Chart | null>(null);
  const chartInstance3small = useRef<Chart | null>(null);
  const chartInstance3large = useRef<Chart | null>(null);

  type AnswerWeights = Record<string, Record<string, number>>;

  const [answerWeights] = useState<AnswerWeights>(createAnswerWeights());

  function createAnswerWeights() {
    return sectionsContent.reduce((sections, section) => {
      var questions: Record<string, number> = {};
      sections[section.id] = questions;

      sectionQuestions(section).forEach(({ type, id, weight = 1 }) => {
        questions[id] = type === SCALE_WITH_COMMENT ? weight : 0;
      });

      return sections;
    }, {} as AnswerWeights);
  }

  useEffect(() => {
    function getSingleAnswer(sectionId: string, questionId: string) {
      const answer = answers[sectionId][questionId] as QuestionAnswer;
      const answerWeight = answerWeights[sectionId][questionId];
      var answerValue = 0;
      if (!answer) {
        throw new Error("Unknown question: " + sectionId + ":" + questionId);
      }
      if (answer.answer && ANSWER_VALUES.hasOwnProperty(answer.answer)) {
        answerValue = ANSWER_VALUES[answer.answer as ANSWER_VALUE_KEY];
      }
      return { value: answerValue * answerWeight, maxValue: answerWeight };
    }

    function calcMultipleAnswers(sectionId: string, questionIds: string[]) {
      var totalValue = 0;
      var totalMaxValue = 0;
      questionIds.forEach((questionId) => {
        const { value, maxValue } = getSingleAnswer(sectionId, questionId);
        totalValue += value;
        totalMaxValue += maxValue;
      });
      return (totalValue * 100) / totalMaxValue;
    }

    function calcSectionAnswers(sectionId: string) {
      const questionIds = Object.keys(answers[sectionId]);
      return calcMultipleAnswers(sectionId, questionIds);
    }

    function calcAnswer(sectionId: string, questionId: string) {
      const { value, maxValue } = getSingleAnswer(sectionId, questionId);
      return (value * 100) / maxValue;
    }

    function chartDataGreenspaceAnswers() {
      return [
        calcAnswer("greenspace", "accessible"),
        calcAnswer("greenspace", "frequentuse"),
        calcAnswer("greenspace", "wildlife"),
        calcAnswer("greenspace", "teaching"),
        calcAnswer("greenspace", "changes"),
      ];
    }

    function chartDataAnswers() {
      return [
        calcSectionAnswers("learning"),
        calcSectionAnswers("play"),
        calcSectionAnswers("wellbeing"),
        calcSectionAnswers("sustainability"),
        calcSectionAnswers("community"),
      ];
    }

    function chartDataPracticeAnswers() {
      return [
        calcMultipleAnswers("practice", [
          "developingcurriculum",
          "curriculumtopic",
          "resources",
          "outcomes",
          "principles",
          "growfood",
        ]),
        calcMultipleAnswers("practice", [
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

    function updateChart(
      chartContainer: MutableRefObject<HTMLCanvasElement | null>,
      chartInstance: MutableRefObject<Chart | null>,
      labels: (string | string[])[],
      data: number[],
      barColour: string,
      small = false
    ) {
      if (chartInstance.current !== null) {
        chartInstance.current.destroy();
      }

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

      const configuration: ChartConfiguration = {
        type: "bar",
        options: {
          animation: {
            duration: 0,
          },
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: 10 },
          scales: {
            x: small ? categoryAxis : valueAxis,
            y: small ? valueAxis : categoryAxis,
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          indexAxis: small ? "x" : "y",
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

      const chartRef = chartContainer.current!.getContext("2d");
      chartInstance.current = new Chart(chartRef!, configuration);
    }

    function updateCharts(
      chartContainerSmall: MutableRefObject<HTMLCanvasElement | null>,
      chartInstanceSmall: MutableRefObject<Chart | null>,
      chartContainerLarge: MutableRefObject<HTMLCanvasElement | null>,
      chartInstanceLarge: MutableRefObject<Chart | null>,
      labels: (string | string[])[],
      data: number[],
      barColour: string
    ) {
      updateChart(
        chartContainerSmall,
        chartInstanceSmall,
        labels,
        data,
        barColour,
        true
      );
      updateChart(
        chartContainerLarge,
        chartInstanceLarge,
        labels,
        data,
        barColour,
        false
      );
    }

    updateCharts(
      chartContainer1small,
      chartInstance1small,
      chartContainer1large,
      chartInstance1large,
      [
        "For Learning",
        "For Play",
        "For Wellbeing",
        "For Sustainability",
        ["For Community", "& Participation"],
      ],
      chartDataAnswers(),
      "#2d6a89"
    );
    updateCharts(
      chartContainer2small,
      chartInstance2small,
      chartContainer2large,
      chartInstance2large,
      [
        "For Accessibility",
        "For Frequent Use",
        "For Wildlife",
        ["For Learning", "& Play"],
        ["For Ease of", "Change"],
      ],
      chartDataGreenspaceAnswers(),
      "#2d6a89"
    );
    updateCharts(
      chartContainer3small,
      chartInstance3small,
      chartContainer3large,
      chartInstance3large,
      ["Learning", "Play"],
      chartDataPracticeAnswers(),
      "#2d6a89"
    );
  }, [answers, answerWeights]);

  return (
    <div className="section results">
      <h2>How Good Is Our Outdoor Space?</h2>
      <div className="results-chart five-bars">
        <canvas className="small-chart" ref={chartContainer1small} />
        <canvas className="large-chart" ref={chartContainer1large} />
      </div>
      <h2>How Good Is Our Local Greenspace?</h2>
      <div className="results-chart five-bars">
        <canvas className="small-chart" ref={chartContainer2small} />
        <canvas className="large-chart" ref={chartContainer2large} />
      </div>
      <h2>How Good Is Our Outdoor Practice?</h2>
      <div className="results-chart two-bars">
        <canvas className="small-chart" ref={chartContainer3small} />
        <canvas className="large-chart" ref={chartContainer3large} />
      </div>
      <SectionBottomNavigation />
    </div>
  );
}

export default ResultsSection;
