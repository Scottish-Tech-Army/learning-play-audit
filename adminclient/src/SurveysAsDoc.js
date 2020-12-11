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
  Table,
  TableRow,
  TableCell,
  TableLayoutType,
  BorderStyle,
} from "docx";

export function exportSurveysAsDocx(surveys = []) {
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
    const response = survey.surveyResponse;

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

const GREY_BORDER = {
  top: { color: "bfbfbf", style: BorderStyle.SINGLE },
  bottom: { color: "bfbfbf", style: BorderStyle.SINGLE },
  left: { color: "bfbfbf", style: BorderStyle.SINGLE },
  right: { color: "bfbfbf", style: BorderStyle.SINGLE },
};

function questionSelectWithComment(question, questionNumber, responses) {
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
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("" + (i + 1))],
              margins: { bottom: 100, top: 100, left: 100, right: 100 },
              borders: GREY_BORDER,
            }),
            new TableCell({
              children: [new Paragraph(getAnswer(response))],
              margins: { bottom: 100, top: 100, left: 100, right: 100 },
              borders: GREY_BORDER,
            }),
            new TableCell({
              children: [new Paragraph(response.comments)],
              margins: { bottom: 100, top: 100, left: 100, right: 100 },
              borders: GREY_BORDER,
            }),
          ],
        });
      }),
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
      case null:
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
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("" + (i + 1))],
              margins: { bottom: 100, top: 100, left: 100, right: 100 },
              borders: GREY_BORDER,
            }),
            new TableCell({
              children: [new Paragraph(getAnswer(response))],
              margins: { bottom: 100, top: 100, left: 100, right: 100 },
              borders: GREY_BORDER,
            }),
            new TableCell({
              children: [
                new Paragraph(labelTitle(response) + " - " + response.comments),
              ],
              margins: { bottom: 100, top: 100, left: 100, right: 100 },
              borders: GREY_BORDER,
            }),
          ],
        });
      }),
    }),
  ];
}

function questionText(question, questionNumber, responses) {
  return [
    renderQuestionText(questionNumber, question.text),
    new Table({
      layout: TableLayoutType.FIXED,
      columnWidths: [300, 8600],
      borders: GREY_BORDER,
      rows: responses.map((response, i) => {
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("" + (i + 1))],
              margins: { bottom: 100, top: 100, left: 100, right: 100 },
              borders: GREY_BORDER,
            }),
            new TableCell({
              children: [
                new Paragraph(response.answer != null ? response.answer : ""),
              ],
              margins: { bottom: 100, top: 100, left: 100, right: 100 },
              borders: GREY_BORDER,
            }),
          ],
        });
      }),
    }),
  ];
}

function questionTextWithYear(question, questionNumber, responses) {
  function yearAnswerRow(response, answerKey, yearKey, index) {
    const answer = response[answerKey] != null ? response[answerKey] : "";
    const year = response[yearKey] != null ? response[yearKey] : "";

    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph("" + index)],
          margins: { bottom: 100, top: 100, left: 100, right: 100 },
          borders: GREY_BORDER,
        }),
        new TableCell({
          children: [new Paragraph(answer)],
          margins: { bottom: 100, top: 100, left: 100, right: 100 },
          borders: GREY_BORDER,
        }),
        new TableCell({
          children: [new Paragraph(year)],
          margins: { bottom: 100, top: 100, left: 100, right: 100 },
          borders: GREY_BORDER,
        }),
      ],
    });
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
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("")],
              margins: { bottom: 100, top: 100, left: 100, right: 100 },
              borders: GREY_BORDER,
            }),
            new TableCell({
              children: [new Paragraph("Improvement")],
              margins: { bottom: 100, top: 100, left: 100, right: 100 },
              borders: GREY_BORDER,
            }),
            new TableCell({
              children: [new Paragraph("Year")],
              margins: { bottom: 100, top: 100, left: 100, right: 100 },
              borders: GREY_BORDER,
            }),
          ],
        }),
        ...responses
          .map((response, i) => {
            if (!questionAnswered(response)) {
              return new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("" + (i + 1))],
                    margins: { bottom: 100, top: 100, left: 100, right: 100 },
                    borders: GREY_BORDER,
                  }),
                  new TableCell({
                    children: [new Paragraph("")],
                    margins: { bottom: 100, top: 100, left: 100, right: 100 },
                    borders: GREY_BORDER,
                  }),
                  new TableCell({
                    children: [new Paragraph("")],
                    margins: { bottom: 100, top: 100, left: 100, right: 100 },
                    borders: GREY_BORDER,
                  }),
                ],
              });
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
