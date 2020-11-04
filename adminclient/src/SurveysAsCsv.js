import {
  SCALE_WITH_COMMENT,
  TEXT,
  TEXT_INLINE_LABEL,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
} from "./QuestionTypes";
import { sectionsContent } from "./Content";
import { saveAs } from "file-saver";

const headerRows = [[""], [""], ["Id"]];

export function exportSurveysAsCsv(surveys = []) {
  if (surveys.length === 0) {
    console.log("No surveys to export");
  }

  // Clone the header rows
  const data = headerRows.map((row) => [...row]);

  sectionsContent.forEach((section, i) => {
    renderSectionHeader(data, section);
  });

  surveys.forEach((survey, i) => {
    const response = JSON.parse(survey.surveyResponse);
    console.log(survey);
    const rowData = [survey.id];

    sectionsContent.forEach((section, i) => {
      renderSectionAnswers(rowData, section, response[section.id]);
    });

    data.push(rowData);
  });

  var csvData = data.map((row) => row.join(",")).join("\n");
  console.log(csvData);

  var blob = new Blob([csvData], {
    type: "text/csv",
    endings: "native",
  });
  saveAs(blob, "export.csv");
}

function renderSectionHeader(data, section) {
  console.log("Render section header " + section.title);

  // Contains question and question part headers
  var questionData = [[], []];

  function addQuestion(type, id, text) {
    const question = { id: id, text: text };

    if (SCALE_WITH_COMMENT === type) {
      questionData[0].push(question.id, "");
      questionData[1].push("answer", "comment");
    } else if (USER_TYPE_WITH_COMMENT === type) {
      questionData[0].push(question.id, "");
      questionData[1].push("role", "details");
    } else if (TEXT === type || TEXT_INLINE_LABEL === type) {
      questionData[0].push(question.id);
      questionData[1].push("answer");
    } else if (TEXT_WITH_YEAR === type) {
      questionData[0].push(question.id, "", "", "", "", "");
      questionData[1].push(
        "answer1",
        "year1",
        "answer2",
        "year2",
        "answer3",
        "year3"
      );
    } else {
      throw new Error("unknown question type: " + type);
    }
  }

  section.content(addQuestion);

  const sectionData = Array(questionData[0].length).fill("");
  sectionData[0] = section.id;

  data[0].push(...sectionData);
  data[1].push(...questionData[0]);
  data[2].push(...questionData[1]);
}

function renderSectionAnswers(rowData, section, sectionResponse) {
  console.log("Render section answers " + section.title);

  function addQuestion(type, id, text) {
    const response = sectionResponse[id];

    if (SCALE_WITH_COMMENT === type || USER_TYPE_WITH_COMMENT === type) {
      addAnswers(rowData, response.answer, response.comments);
    } else if (TEXT === type || TEXT_INLINE_LABEL === type) {
      addAnswers(rowData, response.answer);
    } else if (TEXT_WITH_YEAR === type) {
      addAnswers(
        rowData,
        response.answer1,
        response.year1,
        response.answer2,
        response.year2,
        response.answer3,
        response.year3
      );
    } else {
      throw new Error("unknown question type: " + type);
    }
  }

  section.content(addQuestion);
}

function addAnswers(rowData, ...answers) {
  rowData.push(...answers.map(escapeString));
}

function escapeString(input) {
  return input === null || input.length === 0 ? "" : '"' + input.replace(/"/g, '""') + '"';
}
