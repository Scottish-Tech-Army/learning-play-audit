import React from "react";
import "../App.css";
import { Radar } from "react-chartjs-2";
import Box from "@material-ui/core/Box";
import { useSelector } from "react-redux";
import Button from "@material-ui/core/Button";
import { v4 as uuidv4 } from 'uuid';

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

  async function uploadResults() {
    console.log("Results:");
    console.log(JSON.stringify(answers));

    const request = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({ uuid: uuidv4(), survey: answers }), // body data type must match "Content-Type" header
    };

    fetch("https://apie9w47jf.execute-api.eu-west-2.amazonaws.com/dev", request)
      .then((res) => res.text())
      .then((text) => {
        console.log(text);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <>
      <Box flexDirection="column">
        <Box flexDirection="row">
          <Button variant="outlined" color="primary">
            Print
          </Button>
          <Button variant="outlined" color="primary" onClick={uploadResults}>
            Upload...
          </Button>
        </Box>
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
    </>
  );
}

export default ResultsSection;
