import React from "react";
import "../App.css";
import { addPhotoSvg } from "./SvgUtils";
import { INTRODUCTION } from "./FixedSectionTypes";
import SectionBottomNavigation from "./SectionBottomNavigation";

function ExampleQuestion() {
  const [answer, setAnswer] = React.useState(null);

  function toggleButton(value, label) {
    return (
      <button
        id={value}
        className={answer === value ? "selected" : ""}
        onClick={() => setAnswer(answer === value ? null : value)}
        aria-label={label}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="question">
      <div className="action-row">
        <div className="toggle-button-group">
          {toggleButton("a", "strongly agree")}
          {toggleButton("b", "tend to agree")}
          {toggleButton("c", "tend to disagree")}
          {toggleButton("d", "strongly disagree")}
        </div>
      </div>
    </div>
  );
}

function IntroductionSection({ sections, setCurrentSection }) {
  return (
    <>
      <div className="section introduction">
        <h1 className="title">Introduction</h1>
        <p>
          This audit tool was developed by Learning through Landscapes (LtL) to
          help you reflect on your current outdoor spaces and practice. You can
          then identify priorities for development that might be supported by
          the School Development Plan, colleagues and yourself.
        </p>

        <p>
          You should be able to complete most of the audit in around an hour -
          using your existing knowledge and without the need to collect any
          additional information. In a large school you may not yet be aware of
          all the uses of the outdoor space for learning, and so we suggest you
          ask for input from all teachers into this. A simple way is to ask
          everyone to write on a flip chart or 'stickies' what lesson(s) they
          lead outdoors each academic year.
        </p>

        <p>
          If you don't currently make good use of local greenspace for outdoor
          learning then we suggest that before completing section 7 you should
          visit your nearest area that has potential for learning and play to
          get a better feel for the space. Again, you should check with all
          colleagues in case you are not aware of all the local trips that are
          happening.
        </p>

        <p>
          The results of this audit are for you to then use - we hope it sparks
          thoughts and visits themes you are not aware of.
        </p>
        <p>
          LtL will use anonymised mass data from this survey tool to inform our
          work. Your data is secure and will not be shared with a third party.
        </p>
      </div>
      <div className="section introduction">
        <h1 className="title">How To Complete The Survey</h1>
        <p>
          Most of the 'questions' you will answer are actually statements -
          which you have to respond to on the following scale:
        </p>
        <ExampleQuestion />
        <div className="icons-group">
          <div className="icon-description">
            <img
              className="add-note-icon"
              src={"/assets/add_note.svg"}
              alt="add note"
            />
            Use the note icon to add any notes or comments that you want to
            make.
          </div>
          <div className="icon-description">
            {addPhotoSvg()}
            Use the camera icon to attach any photos you would like to add.
          </div>
        </div>
        <p>
          It is helpful if you answer as many questions as you are able to,
          however it is not compulsory to complete all questions.
        </p>
        <SectionBottomNavigation
          sections={sections}
          currentSectionId={INTRODUCTION}
          setCurrentSectionId={setCurrentSection}
        />
      </div>
    </>
  );
}

export default IntroductionSection;
