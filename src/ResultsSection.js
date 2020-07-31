import React from "react";
import "./App.css";
import { Radar } from "react-chartjs-2";
import Box from "@material-ui/core/Box";
import { useSelector } from "react-redux";

function ResultsSection() {
  const answers = useSelector((state) => state.answers);

  function radarDataGreenspaceAnswers() {
    const answerValues = {
      a: 1,
      b: 0.7,
      c: 0.3,
      d: 0,
    };

    function calcAnswer(singleAnswer) {
      if (singleAnswer === null || singleAnswer === "") {
        return 0;
      }
      return answerValues[singleAnswer.answer] * 100;
    }
    return [
      calcAnswer(answers.greenspace["accessible"]),
      calcAnswer(answers.greenspace["wildlife"]),
      calcAnswer(answers.greenspace["teaching"]),
      calcAnswer(answers.greenspace["changes"]),
    ];
  }

  function radarDataAnswers() {
    console.log("radarDataAnswers");

    const answerValues = {
      a: 1,
      b: 0.7,
      c: 0.3,
      d: 0,
    };

    function calcAnswer(singleAnswer) {
      if (singleAnswer === null || singleAnswer === "") {
        return 0;
      }
      return answerValues[singleAnswer];
    }
    function calcData(sectionAnswers) {
      const vals = Object.values(sectionAnswers);
      console.log(vals);
      const result =
        (vals.reduce(
          (total, singleAnswer) => total + calcAnswer(singleAnswer.answer),
          0
        ) *
          100) /
        vals.length;
      return result;
    }
    const result = [
      calcData(answers.learning),
      calcData(answers.play),
      calcData(answers.wellbeing),
      calcData(answers.sustainability),
      calcData(answers.community),
    ];
    console.log(result);
    return result;
  }

  function drawRadar(labels, dataset) {
    return (
      <Radar
        redraw
        height={500}
        options={{
          animation: {
            duration: 0,
          },
          hover: {
            animationDuration: 0,
          },
          responsiveAnimationDuration: 0,
          scale: {
            ticks: {
              min: 0,
              max: 100,
            },
          },
        }}
        data={{
          labels: labels,
          datasets: [dataset],
        }}
      />
    );
  }

  return (
    <Box flexDirection="column">
      {drawRadar(
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
          label: "How good is our outdoor space?",
        }
      )}
      {drawRadar(
        [
          "for accessibility",
          "for wildlife",
          "for learning and play",
          "for ease of change",
        ],
        {
          data: radarDataGreenspaceAnswers(),
          backgroundColor: "rgb(0, 0, 128, 0.2)",
          borderColor: "blue",
          label: "How good is our local greenspace?",
        }
      )}
    </Box>
  );
}

export default ResultsSection;
