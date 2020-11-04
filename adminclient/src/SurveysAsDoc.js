import {
  SCALE_WITH_COMMENT,
  TEXT,
  TEXT_INLINE_LABEL,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
} from "./QuestionTypes";
import { sectionsContent } from "./Content";
import { Storage } from "aws-amplify";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Media,
  HeadingLevel,
} from "docx";

export function exportSurveysAsDocx(surveys = []) {
  if (surveys.length === 0) {
    console.log("No surveys to export");
  }

  const responses = surveys.map((survey) => JSON.parse(survey.surveyResponse));
  const doc = new Document();

  const paragraphs = sectionsContent
    .map((section, i) => {
      return renderSection(
        section,
        responses.map((response) => response[section.id])
      );
    })
    .flat();

  console.log(paragraphs);
  doc.addSection({
    properties: {},
    children: [
      new Paragraph({
        text: "Survey Responses",
        heading: HeadingLevel.HEADING_1,
      }),
      ...paragraphs,
    ],
  });

  function renderPhoto(photo, i) {
    return Storage.get(photo.fullsize.key, {
      download: true,
    }).then((photoData) => {
      const image = Media.addImage(doc, photoData.Body);
      return Promise.resolve([
        new Paragraph(image),
        new Paragraph({
          children: [
            new TextRun({
              text: photo.description,
            }),
          ],
        }),
      ]);
    });
  }

  function renderSurveyPhotos(survey, i) {
    const response = JSON.parse(survey.surveyResponse);

    return Promise.all(survey.photos.map(renderPhoto)).then((photos) => {
      return Promise.resolve([
        new Paragraph({
          children: [
            new TextRun({
              text: "Images from " + response.background.contactname.answer,
            }),
          ],
        }),
        ...photos.flat(),
      ]);
    });
  }

  Promise.all(
    surveys.filter((survey) => survey.photos.length > 0).map(renderSurveyPhotos)
  )
    .then((photoSections) => {
      doc.addSection({
        children: [
          new Paragraph({
            text: "Survey Photos",
            heading: HeadingLevel.HEADING_1,
          }),
          ...photoSections.flat(),
        ],
      });

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, "example.docx");
      });
    })
    .catch((error) => console.error(error));
}
function getReactElementText(node) {
  if (["string", "number"].includes(typeof node)) {
    return node;
  }
  if (node instanceof Array) {
    return node.map(getReactElementText).join("");
  }
  if (typeof node === "object" && node) {
    return getReactElementText(node.props.children);
  }
}

function renderQuestionText(questionNumber, questionText) {
  return new Paragraph({
    children: [
      new TextRun({
        text: questionNumber + ": " + getReactElementText(questionText),
        bold: true,
      }),
    ],
  });
}

function questionSelectWithComment(question, questionNumber, responses) {
  function getAnswer(response) {
    switch (response.answer) {
      case "a":
        return "a - strongly agree";
      case "b":
        return "b - tend to agree";
      case "c":
        return "c - tend to disagree";
      case "d":
        return "d - strongly disagree";
      case null:
        return "Not answered";
      default:
        return "unknown: " + response.answer;
    }
  }

  return [
    renderQuestionText(questionNumber, question.text),
    new Paragraph({
      children: responses
        .map((response) => {
          return [
            new TextRun({
              text: getAnswer(response),
            }),
            new TextRun({
              text: response.comments,
            }),
          ];
        })
        .flat(),
    }),
  ];
}

function questionUserSelect(question, questionNumber, responses) {
  function getAnswer(response) {
    switch (response.answer) {
      case "a":
        return "teacher";
      case "b":
        return "parent";
      case "c":
        return "pupil";
      case "d":
        return "other";
      default:
        return "unknown: " + response.answer;
    }
  }

  function labelTitle(response) {
    switch (response.answer) {
      case "a":
        return "Position";
      case "c":
        return "Year group";
      default:
        return "Details";
    }
  }

  return [
    renderQuestionText(questionNumber, question.text),
    new Paragraph({
      children: responses
        .map((response) => {
          return [
            new TextRun({
              text: getAnswer(response),
            }),
            new TextRun({
              text: labelTitle(response) + " - " + response.comments,
            }),
          ];
        })
        .flat(),
    }),
  ];
}

function questionText(question, questionNumber, responses) {
  return [
    renderQuestionText(questionNumber, question.text),
    new Paragraph({
      children: responses
        .map((response) => {
          return [
            new TextRun({
              text: response.answer,
            }),
          ];
        })
        .flat(),
    }),
  ];
}

function questionTextWithYear(question, questionNumber, responses) {
  function yearAnswerRow(response, answerKey, yearKey) {
    return [
      new TextRun({
        text: "Improvement: " + response[answerKey],
      }),
      new TextRun({
        text: "Year: " + response[yearKey],
      }),
    ];
  }

  return [
    renderQuestionText(questionNumber, question.text),
    new Paragraph({
      children: responses
        .map((response) => {
          return [
            ...yearAnswerRow(response, "answer1", "year1"),
            ...yearAnswerRow(response, "answer2", "year2"),
            ...yearAnswerRow(response, "answer3", "year3"),
          ];
        })
        .flat(),
    }),
  ];
}

function renderSection(section, sectionResponses) {
  const docQuestions = [
    new Paragraph({
      text: "Section " + section.number + " - " + section.title,
      heading: HeadingLevel.HEADING_2,
    }),
  ];

  var questionIndex = 0;
  function addQuestion(type, id, text) {
    questionIndex += 1;
    const question = { id: id, text: text };
    const responses = sectionResponses.map(
      (sectionResponse) => sectionResponse[id]
    );

    if (SCALE_WITH_COMMENT === type) {
      docQuestions.splice(
        docQuestions.length,
        0,
        ...questionSelectWithComment(question, questionIndex, responses)
      );
    } else if (USER_TYPE_WITH_COMMENT === type) {
      docQuestions.splice(
        docQuestions.length,
        0,
        ...questionUserSelect(question, questionIndex, responses)
      );
    } else if (TEXT === type || TEXT_INLINE_LABEL === type) {
      docQuestions.splice(
        docQuestions.length,
        0,
        ...questionText(question, questionIndex, responses)
      );
    } else if (TEXT_WITH_YEAR === type) {
      docQuestions.splice(
        docQuestions.length,
        0,
        ...questionTextWithYear(question, questionIndex, responses)
      );
    } else {
      throw new Error("unknown question type: " + type);
    }
  }

  section.content(addQuestion);

  return docQuestions;
}

export default exportSurveysAsDocx;
