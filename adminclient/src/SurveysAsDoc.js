import {
  sectionsContent,
  SCALE_WITH_COMMENT,
  TEXT_AREA,
  TEXT_FIELD,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
} from "learning-play-audit-shared";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Media,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TableLayoutType,
  BorderStyle,
} from "docx";

const IMAGE_NOT_FOUND = "[Image not found]";

export function exportSurveysAsDocx(surveys, photos) {
  if (surveys.length === 0) {
    console.log("No surveys to export");
  }

  const responses = surveys.map((survey) => survey.surveyResponse);
  const doc = new Document();

  const paragraphs = sectionsContent
    .map((section, i) => {
      return renderSection(
        section,
        responses.map((response) => response[section.id])
      );
    })
    .flat();

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

  function renderPhoto(photoKey, description) {
    const photoData = photos[photoKey];
    if (photoData.data !== undefined) {
      return [
        new Paragraph(Media.addImage(doc, photoData.data)),
        new Paragraph({ children: [new TextRun({ text: description })] }),
      ];
    }

    return [
      new Paragraph({ children: [new TextRun({ text: IMAGE_NOT_FOUND })] }),
      new Paragraph({ children: [new TextRun({ text: description })] }),
    ];
  }

  function renderSurveyPhotos(survey) {
    const response = survey.surveyResponse;

    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "Images from " + response.background.contactname.answer,
          }),
        ],
      }),
      ...survey.photos
        .map((photoRef) =>
          renderPhoto(photoRef.fullsize.key, photoRef.description)
        )
        .flat(),
    ];
  }

  const photoSections = surveys
    .filter((survey) => survey.photos.length > 0)
    .map(renderSurveyPhotos);

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
    saveAs(blob, "SurveyReport.docx");
  });
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

const GREY_BORDER = {
  top: { color: "bfbfbf", style: BorderStyle.SINGLE },
  bottom: { color: "bfbfbf", style: BorderStyle.SINGLE },
  left: { color: "bfbfbf", style: BorderStyle.SINGLE },
  right: { color: "bfbfbf", style: BorderStyle.SINGLE },
};

function tableRow(...cellsContent) {
  return new TableRow({
    children: cellsContent.map(tableCell),
  });
}

function tableCell(content) {
  return new TableCell({
    children: [new Paragraph(content)],
    margins: { bottom: 100, top: 100, left: 100, right: 100 },
    borders: GREY_BORDER,
  });
}

function renderQuestionTypeSelectWithComment(
  question,
  questionNumber,
  responses
) {
  function getAnswer(response) {
    switch (response.answer) {
      case "a":
        return "strongly agree";
      case "b":
        return "tend to agree";
      case "c":
        return "tend to disagree";
      case "d":
        return "strongly disagree";
      case null:
      case "":
        return "";
      default:
        return "unknown: " + response.answer;
    }
  }

  return [
    renderQuestionText(questionNumber, question.text),
    new Table({
      layout: TableLayoutType.FIXED,
      columnWidths: [300, 1600, 7000],
      borders: GREY_BORDER,
      rows: responses.map((response, i) => {
        return tableRow("" + (i + 1), getAnswer(response), response.comments);
      }),
    }),
  ];
}

function renderQuestionTypeUserSelect(question, questionNumber, responses) {
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
      case null:
      case "":
        return "";
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
    new Table({
      layout: TableLayoutType.FIXED,
      columnWidths: [300, 1600, 7000],
      borders: GREY_BORDER,

      rows: responses.map((response, i) => {
        return tableRow(
          "" + (i + 1),
          getAnswer(response),
          labelTitle(response) + " - " + response.comments
        );
      }),
    }),
  ];
}

function renderQuestionTypeText(question, questionNumber, responses) {
  return [
    renderQuestionText(questionNumber, question.text),
    new Table({
      layout: TableLayoutType.FIXED,
      columnWidths: [300, 8600],
      borders: GREY_BORDER,
      rows: responses.map((response, i) => {
        return tableRow(
          "" + (i + 1),
          response.answer != null ? response.answer : ""
        );
      }),
    }),
  ];
}

function renderQuestionTypeTextWithYear(question, questionNumber, responses) {
  function yearAnswerRow(response, answerKey, yearKey, index) {
    const answer = response[answerKey] != null ? response[answerKey] : "";
    const year = response[yearKey] != null ? response[yearKey] : "";

    return tableRow("" + index, answer, year);
  }

  function hasValue(value) {
    return value != null && value.length > 0;
  }

  function questionAnswered(response) {
    return (
      hasValue(response.answer1) ||
      hasValue(response.answer2) ||
      hasValue(response.answer3) ||
      hasValue(response.year1) ||
      hasValue(response.year2) ||
      hasValue(response.year3)
    );
  }

  return [
    renderQuestionText(questionNumber, question.text),
    new Table({
      layout: TableLayoutType.FIXED,
      columnWidths: [300, 8000, 600],
      borders: GREY_BORDER,
      rows: [
        tableRow("", "Improvement", "Year"),
        ...responses
          .map((response, i) => {
            if (!questionAnswered(response)) {
              return tableRow("" + (i + 1), "", "");
            }

            return [
              yearAnswerRow(response, "answer1", "year1", i + 1),
              yearAnswerRow(response, "answer2", "year2", i + 1),
              yearAnswerRow(response, "answer3", "year3", i + 1),
            ];
          })
          .flat(),
      ],
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
        ...renderQuestionTypeSelectWithComment(
          question,
          questionIndex,
          responses
        )
      );
    } else if (USER_TYPE_WITH_COMMENT === type) {
      docQuestions.splice(
        docQuestions.length,
        0,
        ...renderQuestionTypeUserSelect(question, questionIndex, responses)
      );
    } else if (TEXT_AREA === type || TEXT_FIELD === type) {
      docQuestions.splice(
        docQuestions.length,
        0,
        ...renderQuestionTypeText(question, questionIndex, responses)
      );
    } else if (TEXT_WITH_YEAR === type) {
      docQuestions.splice(
        docQuestions.length,
        0,
        ...renderQuestionTypeTextWithYear(question, questionIndex, responses)
      );
    } else {
      throw new Error("unknown question type: " + type);
    }
  }

  section.content(addQuestion);

  return docQuestions;
}

export default exportSurveysAsDocx;
