import {
  sectionQuestions,
  sectionsContent,
  SCALE_WITH_COMMENT,
  TEXT_AREA,
  TEXT_FIELD,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
  Question,
  Section,
  Markup,
} from "learning-play-audit-survey";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TableLayoutType,
  BorderStyle,
} from "docx";
import {
  DatedQuestionAnswer,
  DatedQuestionAnswerKey,
  Photo,
  QuestionAnswer,
  SectionAnswers,
  SurveyResponse,
} from "./model/SurveyModel";

const IMAGE_NOT_FOUND = "[Image not found]";

export function exportSurveysAsDocx(
  surveys: SurveyResponse[],
  photos: Record<string, Photo>
) {
  if (surveys.length === 0) {
    console.log("No surveys to export");
  }

  console.log("exportSurveysAsDocx", surveys, photos);
  const responses = surveys.map((survey) => survey.surveyResponse);

  const paragraphs = sectionsContent
    .map((section, i) => {
      const sectionResponses = responses.map(
        (response) => response[section.id]
      );
      return renderSection(section, sectionResponses);
    })
    .flat();

  const sections = [];

  sections.push({
    properties: {},
    children: [
      new Paragraph({
        text: "Survey Responses",
        heading: HeadingLevel.HEADING_1,
      }),
      ...paragraphs,
    ],
  });

  function renderPhoto(
    photoKey: string,
    description: string,
    height: number,
    width: number
  ) {
    const photoData = photos[photoKey];
    if (photoData.data !== undefined) {
      const scaledWidth = (width * 200) / height;
      return [
        new Paragraph({
          children: [
            new ImageRun({
              data: photoData.data,
              transformation: { height: 200, width: scaledWidth },
            }),
          ],
        }),
        new Paragraph({ children: [new TextRun({ text: description })] }),
      ];
    }

    return [
      new Paragraph({ children: [new TextRun({ text: IMAGE_NOT_FOUND })] }),
      new Paragraph({ children: [new TextRun({ text: description })] }),
    ];
  }

  function renderSurveyPhotos(survey: SurveyResponse) {
    const response = survey.surveyResponse;

    return [
      new Paragraph({
        children: [
          new TextRun({
            text:
              "Images from " +
              (response.background.contactname as QuestionAnswer).answer,
          }),
        ],
      }),
      ...survey.photos
        .map((photoRef) =>
          renderPhoto(
            photoRef.fullsize.key,
            photoRef.description,
            photoRef.fullsize.height,
            photoRef.fullsize.width
          )
        )
        .flat(),
    ];
  }

  const photoSections = surveys
    .filter((survey) => survey.photos.length > 0)
    .map(renderSurveyPhotos);

  sections.push({
    children: [
      new Paragraph({
        text: "Survey Photos",
        heading: HeadingLevel.HEADING_1,
      }),
      ...photoSections.flat(),
    ],
  });

  const doc = new Document({ sections: sections });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "SurveyReport.docx");
  });
}

function renderMarkup(markup: Markup | Markup[]): string {
  if (!markup) {
    return "";
  }
  if (typeof markup === "string") {
    return markup;
  }
  if (Array.isArray(markup)) {
    return markup.map(renderMarkup).join("");
  }
  return renderMarkup(markup.content);
}

function renderQuestionText(
  questionNumber: number,
  questionText: Markup | Markup[]
) {
  return new Paragraph({
    children: [
      new TextRun({
        text: questionNumber + ": " + renderMarkup(questionText),
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

function tableRow(...cellsContent: string[]) {
  return new TableRow({
    children: cellsContent.map(tableCell),
  });
}

function tableCell(content: string) {
  return new TableCell({
    children: [new Paragraph(content)],
    margins: { bottom: 100, top: 100, left: 100, right: 100 },
    borders: GREY_BORDER,
  });
}

function renderQuestionTypeSelectWithComment(
  question: Question,
  questionNumber: number,
  responses: QuestionAnswer[]
) {
  function getAnswer(response: QuestionAnswer) {
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
        return tableRow(
          "" + (i + 1),
          response ? getAnswer(response) : "",
          response ? response.comments : ""
        );
      }),
    }),
  ];
}

function renderQuestionTypeUserSelect(
  question: Question,
  questionNumber: number,
  responses: QuestionAnswer[]
): (Paragraph | Table)[] {
  function getAnswer(response: QuestionAnswer) {
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

  function labelTitle(response: QuestionAnswer): String {
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

function renderQuestionTypeText(
  question: Question,
  questionNumber: number,
  responses: QuestionAnswer[]
) {
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

function renderQuestionTypeTextWithYear(
  question: Question,
  questionNumber: number,
  responses: DatedQuestionAnswer[]
) {
  function yearAnswerRow(
    response: DatedQuestionAnswer,
    answerKey: DatedQuestionAnswerKey,
    yearKey: DatedQuestionAnswerKey,
    index: number
  ) {
    const answer = response[answerKey] != null ? response[answerKey] : "";
    const year = response[yearKey] != null ? response[yearKey] : "";

    return tableRow("" + index, answer, year);
  }

  function hasValue(value: string) {
    return value != null && value.length > 0;
  }

  function questionAnswered(response: DatedQuestionAnswer) {
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

function renderSection(section: Section, sectionResponses: SectionAnswers[]) {
  const docQuestions: (Paragraph | Table)[] = [
    new Paragraph({
      text: "Section " + section.number + " - " + section.title,
      heading: HeadingLevel.HEADING_2,
    }),
  ];

  var questionIndex = 0;
  function addQuestion(question: Question) {
    const { type, id } = question;
    questionIndex += 1;
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
          responses as QuestionAnswer[]
        )
      );
    } else if (USER_TYPE_WITH_COMMENT === type) {
      docQuestions.splice(
        docQuestions.length,
        0,
        ...renderQuestionTypeUserSelect(
          question,
          questionIndex,
          responses as QuestionAnswer[]
        )
      );
    } else if (TEXT_AREA === type || TEXT_FIELD === type) {
      docQuestions.splice(
        docQuestions.length,
        0,
        ...renderQuestionTypeText(
          question,
          questionIndex,
          responses as QuestionAnswer[]
        )
      );
    } else if (TEXT_WITH_YEAR === type) {
      docQuestions.splice(
        docQuestions.length,
        0,
        ...renderQuestionTypeTextWithYear(
          question,
          questionIndex,
          responses as DatedQuestionAnswer[]
        )
      );
    } else {
      throw new Error("unknown question type: " + type);
    }
  }

  sectionQuestions(section).forEach(addQuestion);

  return docQuestions;
}

export default exportSurveysAsDocx;
