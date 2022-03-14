import {
  sectionsContent,
  SCALE_WITH_COMMENT,
  TEXT_AREA,
  TEXT_FIELD,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
} from "./Content";
import {
  Document,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  TabStopType,
  ShadingType,
  Header,
  Footer,
  HorizontalPositionRelativeFrom,
  convertInchesToTwip,
  VerticalPositionAlign,
  AlignmentType,
  VerticalPositionRelativeFrom,
  TableCell,
  TableRow,
  Table,
  WidthType,
  BorderStyle,
} from "docx";
import {
  REPORT_FOOTER_BASE64,
  REPORT_HEADER_BASE64,
} from "./reportImagesBase64";

const IMAGE_NOT_FOUND = "[Image not found]";

const PAGE_MARGINS = {
  top: convertInchesToTwip(1.6),
  right: convertInchesToTwip(1),
  bottom: convertInchesToTwip(0.5),
  left: convertInchesToTwip(1),
};

const PHOTO_TABLE_CELL_OPTIONS = {
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
  },
  margins: {
    marginUnitType: WidthType.DXA,
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
  },
};

export async function exportSurveyAsDocx(
  surveyResponse,
  photosDetails,
  photosData
) {
  // console.log("exportSurveyAsDocx", survey, photos);

  const surveyQuestionParagraphs = sectionsContent
    .map((section) => {
      return renderSection(section, surveyResponse[section.id]);
    })
    .flat();

  let photosParagraphs = [];
  if (photosDetails?.length > 0) {
    const photosTable = new Table({
      rows: photosDetails.map((photoRef) =>
        renderPhotoRow(
          photoRef.fullsize.key,
          photoRef.description,
          photoRef.fullsize.height,
          photoRef.fullsize.width
        )
      ),
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    photosParagraphs = [
      new Paragraph({
        text: "Survey Photos",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      }),
      photosTable,
    ];
  }

  const headers = {
    default: new Header({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              // data: fs.readFileSync("./reportHeader.png"),
              data: Buffer.from(REPORT_HEADER_BASE64, "base64"),
              transformation: { height: 187, width: 794 },
              floating: {
                horizontalPosition: {
                  relative: HorizontalPositionRelativeFrom.PAGE,
                  offset: 0,
                },
                verticalPosition: {
                  relative: VerticalPositionRelativeFrom.PAGE,
                  offset: 0,
                },
              },
            }),
          ],
        }),
      ],
    }),
  };

  const footers = {
    default: new Footer({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              // data: fs.readFileSync("./reportFooter.png"),
              data: Buffer.from(REPORT_FOOTER_BASE64, "base64"),
              transformation: { height: 54, width: 794 },
              floating: {
                horizontalPosition: {
                  relative: HorizontalPositionRelativeFrom.PAGE,
                  offset: 0,
                },
                verticalPosition: {
                  relative: VerticalPositionRelativeFrom.PAGE,
                  offset: 0,
                  align: VerticalPositionAlign.BOTTOM,
                },
              },
            }),
          ],
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          style: "FooterText",
          text: "© Learning through Landscapes  |   www.ltl.org.uk",
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          style: "FooterText",
          text: "Registered charity no. in England and Wales 803270 and in Scotland SCO38890",
        }),
      ],
    }),
  };

  function getScaledPhotoDimensions(height, width) {
    const MAX_PHOTO_WIDTH = 290;
    const scaledHeight = (height * MAX_PHOTO_WIDTH) / width;
    return { height: scaledHeight, width: MAX_PHOTO_WIDTH };
  }

  function renderPhotoRow(photoKey, description, height, width) {
    console.log("renderPhoto params", photoKey, description, height, width);
    const photoData = photosData?.[photoKey];
    if (photoData?.data) {
      return new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: photoData.data,
                    transformation: getScaledPhotoDimensions(height, width),
                  }),
                ],
              }),
            ],
            ...PHOTO_TABLE_CELL_OPTIONS,
          }),
          new TableCell({
            children: [new Paragraph({ text: description })],
            ...PHOTO_TABLE_CELL_OPTIONS,
          }),
        ],
      });
    }

    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: IMAGE_NOT_FOUND })],
          ...PHOTO_TABLE_CELL_OPTIONS,
        }),
        new TableCell({
          children: [new Paragraph({ text: description })],
          ...PHOTO_TABLE_CELL_OPTIONS,
        }),
      ],
    });
  }

  return new Document({
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, color: "#a7cd45" },
          paragraph: { spacing: { after: 120 } },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 20, bold: true },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        {
          id: "FooterText",
          name: "FooterText",
          basedOn: "Normal",
          next: "Normal",
          run: { color: "999999", size: 16 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: { margin: PAGE_MARGINS },
        },
        headers,
        footers,
        children: [
          new Paragraph({
            text: "Survey Responses",
            heading: HeadingLevel.HEADING_1,
          }),
          ...surveyQuestionParagraphs,
          ...photosParagraphs,
        ],
      },
    ],
  });
}

function spaceTextRuns(textRuns) {
  if (textRuns.length <= 1) {
    return textRuns;
  }

  // Add spaces between textruns
  const spacedTextRuns = [];
  textRuns.forEach((node) => {
    spacedTextRuns.push(node);
    spacedTextRuns.push(new TextRun({ text: " " }));
  });
  spacedTextRuns.pop();
  return spacedTextRuns;
}

export function renderQuestionText(questionNumber, questionText) {
  const nodes = questionText instanceof Array ? questionText : [questionText];

  let children = nodes.map((node) => {
    if (typeof node === "string") {
      return new TextRun({ text: node });
    }

    if (typeof node === "object" && node && node.tag === "b") {
      return new TextRun({ text: node.content, bold: true });
    }
  });

  return new Paragraph({
    children: [
      new TextRun({
        text: questionNumber + ":\t",
        bold: true,
      }),
      ...spaceTextRuns(children),
    ],
    tabStops: [{ type: TabStopType.LEFT, position: 500 }],
    indent: { start: 500, hanging: 500 },
    shading: { type: ShadingType.CLEAR, fill: "D0D0D0" },
    spacing: { before: 200, after: 50 },
  });
}

function renderSubsectionParagraph({ tag, content }) {
  if (tag === "h2" && typeof content === "string") {
    return new Paragraph({ text: content, heading: HeadingLevel.HEADING_2 });
  }

  if (tag === "p") {
    const nodes = content instanceof Array ? content : [content];

    let children = nodes.map((node) => {
      if (typeof node === "string") {
        return new TextRun({ text: node });
      }

      if (typeof node === "object" && node && node.tag === "b") {
        return new TextRun({ text: node.content, bold: true });
      }
    });

    return new Paragraph({ children: spaceTextRuns(children) });
  }
}

export function renderSubsectionTitle(title) {
  return title instanceof Array
    ? title.map(renderSubsectionParagraph)
    : [renderSubsectionParagraph(title)];
}

function renderQuestionTypeSelectWithComment(
  question,
  questionNumber,
  response
) {
  function getAnswer(response) {
    switch (response.answer) {
      case "a":
        return "Strongly agree";
      case "b":
        return "Tend to agree";
      case "c":
        return "Tend to disagree";
      case "d":
        return "Strongly disagree";
      case null:
      case "":
        return "";
      default:
        return "Unknown: " + response.answer;
    }
  }

  let answer = response ? getAnswer(response) : "";
  let comment = response?.comments || "";

  const text =
    answer && comment
      ? answer + ":\t" + comment
      : answer
      ? answer
      : comment
      ? comment
      : "Not answered";

  return [
    renderQuestionText(questionNumber, question.text),
    new Paragraph({
      text,
      tabStops: [{ type: TabStopType.LEFT, position: 1500 }],
      indent: { start: 1500, hanging: 1500 },
    }),
  ];
}

function renderQuestionTypeUserSelect(question, questionNumber, response) {
  function getAnswer(response) {
    switch (response.answer) {
      case "a":
        return "Teacher";
      case "b":
        return "Parent";
      case "c":
        return "Pupil";
      case "d":
        return "Other";
      case null:
      case "":
        return "";
      default:
        return "Unknown: " + response.answer;
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

  let answer = response ? getAnswer(response) : "";
  let comment = response?.comments
    ? labelTitle(response) + ": " + response.comments
    : "";

  const text =
    answer && comment
      ? answer + "\t" + comment
      : answer
      ? answer
      : comment
      ? comment
      : "Not answered";

  return [
    renderQuestionText(questionNumber, question.text),
    new Paragraph({
      text,
      tabStops: [{ type: TabStopType.LEFT, position: 1500 }],
      indent: { start: 1500, hanging: 1500 },
    }),
  ];
}

function renderQuestionTypeText(question, questionNumber, response) {
  return [
    renderQuestionText(questionNumber, question.text),
    new Paragraph({ text: response?.answer || "Not answered" }),
  ];
}

function renderQuestionTypeTextWithYear(question, questionNumber, response) {
  function yearAnswerRow(response, answerKey, yearKey) {
    const answer = response[answerKey] != null ? response[answerKey] : "";
    const year = response[yearKey] != null ? response[yearKey] : "";

    return answer && year
      ? new Paragraph({
          text: year + "\t" + answer,
          tabStops: [{ type: TabStopType.LEFT, position: 500 }],
          indent: { start: 500, hanging: 500 },
        })
      : year
      ? new Paragraph({ text: year })
      : answer
      ? new Paragraph({ text: answer })
      : null;
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
    ...(questionAnswered(response)
      ? [
          yearAnswerRow(response, "answer1", "year1"),
          yearAnswerRow(response, "answer2", "year2"),
          yearAnswerRow(response, "answer3", "year3"),
        ].filter(Boolean)
      : [new Paragraph({ text: "Not answered" })]),
  ];
}

function renderQuestion(
  { type, id, text },
  questionIndex,
  sectionResponses,
  paragraphs
) {
  const question = { id: id, text: text };
  const response = sectionResponses[id];

  if (SCALE_WITH_COMMENT === type) {
    paragraphs.splice(
      paragraphs.length,
      0,
      ...renderQuestionTypeSelectWithComment(question, questionIndex, response)
    );
  } else if (USER_TYPE_WITH_COMMENT === type) {
    paragraphs.splice(
      paragraphs.length,
      0,
      ...renderQuestionTypeUserSelect(question, questionIndex, response)
    );
  } else if (TEXT_AREA === type || TEXT_FIELD === type) {
    paragraphs.splice(
      paragraphs.length,
      0,
      ...renderQuestionTypeText(question, questionIndex, response)
    );
  } else if (TEXT_WITH_YEAR === type) {
    paragraphs.splice(
      paragraphs.length,
      0,
      ...renderQuestionTypeTextWithYear(question, questionIndex, response)
    );
  } else {
    throw new Error("unknown question type: " + type);
  }
}

function renderSection(section, sectionResponses) {
  const docQuestions = [
    new Paragraph({
      text: "Section " + section.number + " - " + section.title,
      heading: HeadingLevel.HEADING_2,
    }),
  ];

  var questionIndex = 0;

  section.subsections.forEach((subsection) => {
    subsection.title &&
      renderSubsectionTitle(subsection.title).forEach((paragraph) =>
        docQuestions.push(paragraph)
      );
    subsection.questions.forEach((question) => {
      questionIndex++;
      renderQuestion(question, questionIndex, sectionResponses, docQuestions);
    });
  });

  return docQuestions;
}

export default exportSurveyAsDocx;
