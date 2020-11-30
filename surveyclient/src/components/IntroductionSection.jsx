import React from "react";
import "../App.css";

function ExampleQuestion() {
  const [answer, setAnswer] = React.useState(null);

  function toggleButton(value, label) {
    return (
      <button
        className={answer === value ? "selected" : ""}
        onClick={() => setAnswer(value)}
        aria-label={label}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="question">
      <div className="actionRow">
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

function IntroductionSection() {
  return (
    <>
      <div className="subsection">
        <h1 className="title">Introduction</h1>
        <p>
          This audit tool was developed by Grounds for Learning to help you
          reflect on your current outdoor spaces and practice, so that you can
          identify priorities for development that might be supported by the
          School Development Plan, colleagues and yourself.
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
          happening. Use the same session and tool to ask all staff what local
          sessions they lead each year.
        </p>

        <p>
          The results of this audit are for you to then use - we hope it sparks
          thoughts and visits themes you are not aware of.
        </p>
      </div>
      <div className="subsection">
        <h1 className="title">How To Complete The Survey</h1>
        <p>
          Most of the 'questions' you will answer are actually statements -
          which you have to respond to on the following scale:
        </p>
        <ExampleQuestion />
        <p>
          Use the note icon to add any notes or comments that you want to make.
        </p>
        <p>Use the camera icon to attach any photos you would like to add.</p>
      </div>
    </>
  );
}

export default IntroductionSection;
