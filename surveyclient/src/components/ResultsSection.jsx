import React, { useRef, useEffect } from "react";
import "../App.css";
import Box from "@material-ui/core/Box";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Chart from "chart.js";
import { sectionsContent } from "../model/Content";

const useStyles = makeStyles((theme) => ({
  resultsChart: {
    position: "relative",
    // display: "flex",
    width: "60vw",
  },
}));

function ResultsSection() {
  const answers = useSelector((state) => state.answers);
  const classes = useStyles();
  const chartContainer1 = useRef();
  const chartContainer2 = useRef();
  const chartContainer3 = useRef();
  const chartInstance1 = useRef(null);
  const chartInstance2 = useRef(null);
  const chartInstance3 = useRef(null);

  const [answerWeights] = React.useState(createAnswerWeights());

  function createAnswerWeights() {
    return sectionsContent.reduce((sections, section) => {
      var questions = {};
      sections[section.id] = questions;
      // Use addQuestion to gather question weights
      section.content((type, id, text, weight = 1) => (questions[id] = weight));
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

    function radarDataGreenspaceAnswers() {
      return [
        calcAnswer(answers, answerWeights, "greenspace", "accessible"),
        calcAnswer(answers, answerWeights, "greenspace", "frequentuse"),
        calcAnswer(answers, answerWeights, "greenspace", "wildlife"),
        calcAnswer(answers, answerWeights, "greenspace", "teaching"),
        calcAnswer(answers, answerWeights, "greenspace", "changes"),
      ];
    }

    function radarDataAnswers() {
      console.log("radarDataAnswers");

      return [
        calcSectionAnswers(answers, answerWeights, "learning"),
        calcSectionAnswers(answers, answerWeights, "play"),
        calcSectionAnswers(answers, answerWeights, "wellbeing"),
        calcSectionAnswers(answers, answerWeights, "sustainability"),
        calcSectionAnswers(answers, answerWeights, "community"),
      ];
    }

    function radarDataPracticeAnswers() {
      console.log("radarDataPracticeAnswers");
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

    function updateChart(chartContainer, chartInstance, labels, dataset) {
      if (chartInstance.current !== null) {
        chartInstance.current.destroy();
      }

      const configuration = {
        type: "horizontalBar",
        options: {
          animation: {
            duration: 0,
          },
          hover: {
            animationDuration: 0,
          },
          responsiveAnimationDuration: 0,
          responsive: true,
          scales: {
            xAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  suggestedMin: 0,
                  suggestedMax: 100,
                },
              },
            ],
          },
        },
        data: {
          labels: labels,
          datasets: [dataset],
        },
      };

      const chartRef = chartContainer.current.getContext("2d");
      chartInstance.current = new Chart(chartRef, configuration);
    }

    updateChart(
      chartContainer1,
      chartInstance1,
      [
        "for learning",
        "for play",
        "for wellbeing",
        "for sustainability",
        "for community & participation",
      ],
      {
        data: radarDataAnswers(),
        backgroundColor: "rgb(0, 128, 0, 0.2)",
        borderColor: "green",
        label: "Results",
        // label: "How good is our outdoor space?",
      }
    );
    updateChart(
      chartContainer2,
      chartInstance2,
      [
        "for accessibility",
        "for frequent use",
        "for wildlife",
        "for learning and play",
        "for ease of change",
      ],
      {
        data: radarDataGreenspaceAnswers(),
        backgroundColor: "rgb(0, 0, 128, 0.2)",
        borderColor: "blue",
        label: "Results",
      }
    );
    updateChart(chartContainer3, chartInstance3, ["learning", "play"], {
      data: radarDataPracticeAnswers(),
      backgroundColor: "rgb(128, 0, 0, 0.2)",
      borderColor: "red",
      label: "Results",
    });
  }, [answers, answerWeights]);

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch">
      <h2>How good is our outdoor space?</h2>
      <div className={classes.resultsChart}>
        <canvas ref={chartContainer1} />
      </div>
      <h2>How good is our local greenspace?</h2>
      <div className={classes.resultsChart}>
        <canvas ref={chartContainer2} />
      </div>
      <h2>How good is our outdoor practice?</h2>
      <div className={classes.resultsChart}>
        <canvas ref={chartContainer3} />
      </div>
    </Box>
  );
}

// <Box display="flex" flexDirection="row">
//   <Button variant="outlined" color="primary">
//     Print
//   </Button>
// </Box>

export default ResultsSection;
