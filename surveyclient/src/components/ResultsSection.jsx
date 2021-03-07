import React, { useRef, useEffect } from "react";
import "../App.css";
import { useSelector } from "react-redux";
import Chart from "chart.js";
import {
  sectionsContent,
  SCALE_WITH_COMMENT,
} from "learning-play-audit-shared";
import { RESULTS } from "./FixedSectionTypes";
import SectionBottomNavigation from "./SectionBottomNavigation";

function ResultsSection({ sections, setCurrentSection }) {
  const answers = useSelector((state) => state.answers);
  const chartContainer1small = useRef();
  const chartContainer1large = useRef();
  const chartContainer2small = useRef();
  const chartContainer2large = useRef();
  const chartContainer3small = useRef();
  const chartContainer3large = useRef();
  const chartInstance1small = useRef(null);
  const chartInstance1large = useRef(null);
  const chartInstance2small = useRef(null);
  const chartInstance2large = useRef(null);
  const chartInstance3small = useRef(null);
  const chartInstance3large = useRef(null);

  const [answerWeights] = React.useState(createAnswerWeights());

  function createAnswerWeights() {
    return sectionsContent.reduce((sections, section) => {
      var questions = {};
      sections[section.id] = questions;
      // Use addQuestion to gather question weights
      section.content(
        (type, id, text, weight = 1) =>
          (questions[id] = type === SCALE_WITH_COMMENT ? weight : 0)
      );
      return sections;
    }, {});
  }

  useEffect(() => {
    const ANSWER_VALUES = { a: 1, b: 0.7, c: 0.3, d: 0 };

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

    function calcMultipleAnswers(
      answers,
      answerWeights,
      sectionId,
      questionIds
    ) {
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
      return calcMultipleAnswers(
        answers,
        answerWeights,
        sectionId,
        questionIds
      );
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

    function chartDataGreenspaceAnswers() {
      return [
        calcAnswer(answers, answerWeights, "greenspace", "accessible"),
        calcAnswer(answers, answerWeights, "greenspace", "frequentuse"),
        calcAnswer(answers, answerWeights, "greenspace", "wildlife"),
        calcAnswer(answers, answerWeights, "greenspace", "teaching"),
        calcAnswer(answers, answerWeights, "greenspace", "changes"),
      ];
    }

    function chartDataAnswers() {
      return [
        calcSectionAnswers(answers, answerWeights, "learning"),
        calcSectionAnswers(answers, answerWeights, "play"),
        calcSectionAnswers(answers, answerWeights, "wellbeing"),
        calcSectionAnswers(answers, answerWeights, "sustainability"),
        calcSectionAnswers(answers, answerWeights, "community"),
      ];
    }

    function chartDataPracticeAnswers() {
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

    function updateChart(
      chartContainer,
      chartInstance,
      labels,
      data,
      barColour,
      small = false
    ) {
      if (chartInstance.current !== null) {
        chartInstance.current.destroy();
      }

      const valueAxis = {
        gridLines: {
          color: "#807d7d",
          z: 1,
        },
        ticks: {
          beginAtZero: true,
          suggestedMin: 0,
          suggestedMax: 100,
          fontSize: 14,
        },
      };

      const categoryAxis = {
        gridLines: {
          color: "#807d7d",
          z: 1,
        },
        ticks: {
          fontSize: 16,
          fontStyle: "bold",
        },
      };

      const configuration = {
        type: small ? "bar" : "horizontalBar",
        options: {
          animation: {
            duration: 0,
          },
          hover: {
            animationDuration: 0,
          },
          responsiveAnimationDuration: 0,
          responsive: true,
          maintainAspectRatio: false,
          legend: false,
          borderWidth: 10,
          scales: {
            xAxes: [small ? categoryAxis : valueAxis],
            yAxes: [small ? valueAxis : categoryAxis],
          },
          tooltips: {
            enabled: false,
          },
        },
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
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

      const chartRef = chartContainer.current.getContext("2d");
      chartInstance.current = new Chart(chartRef, configuration);
    }

    function updateCharts(
      chartContainerSmall,
      chartInstanceSmall,
      chartContainerLarge,
      chartInstanceLarge,
      labels,
      data,
      barColour
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
      <SectionBottomNavigation
        sections={sections}
        currentSectionId={RESULTS}
        setCurrentSectionId={setCurrentSection}
      />
    </div>
  );
}

export default ResultsSection;
