import { sectionQuestions, sectionsContent } from "./survey";

describe("sectionQuestions", () => {
  it("should return list of section questions", () => {
    const questions = sectionQuestions(
      sectionsContent.find((section) => section.id === "reflection")!
    );
    expect(questions.map((question) => question.id)).toEqual([
      "groundsadvisor",
      "onlineresources",
      "CPD",
      "straightforward",
      "ideas",
    ]);
  });
});
