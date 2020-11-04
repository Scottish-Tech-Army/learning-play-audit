import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import CommentIcon from "@material-ui/icons/Comment";
import CommentOutlinedIcon from "@material-ui/icons/CommentOutlined";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  question: {
    width: "100%",
    paddingTop: "1em",
    paddingBottom: "1em",
  },
  actionRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
  },
  commentboxHidden: {
    display: "none",
  },
  commentbox: {
    paddingTop: "1em",
  },
  logo: {
    flexShrink: "0",
  },
  title: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
  },
}));

function ExampleQuestion() {
  const classes = useStyles();

  function hasComment() {
    return comment !== null && comment.length > 0;
  }

  const [showComment, setShowComment] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [answer, setAnswer] = React.useState(null);

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };
  const handleCommentButtonClick = (event) => {
    setShowComment((current) => !current || hasComment());
  };
  const handleChange = (event, newValue) => {
    setAnswer(newValue);
  };

  return (
    <div className={classes.question}>
      <Box className={classes.actionRow}>
        <ToggleButtonGroup
          value={answer}
          exclusive
          onChange={handleChange}
          aria-label="example question"
        >
          <ToggleButton value="a" aria-label="strongly agree">
            strongly agree
          </ToggleButton>
          <ToggleButton value="b" aria-label="tend to agree">
            tend to agree
          </ToggleButton>
          <ToggleButton value="c" aria-label="tend to disagree">
            tend to disagree
          </ToggleButton>
          <ToggleButton value="d" aria-label="strongly disagree">
            strongly disagree
          </ToggleButton>
        </ToggleButtonGroup>
        <IconButton
          aria-label="show comment"
          onClick={handleCommentButtonClick}
        >
          {hasComment() ? (
            <CommentIcon fontSize="inherit" />
          ) : (
            <CommentOutlinedIcon fontSize="inherit" />
          )}
        </IconButton>
      </Box>
      <div
        className={showComment ? classes.commentbox : classes.commentboxHidden}
      >
        <TextField
          id="outlined-multiline-flexible"
          label="Comments / Notes"
          multiline
          fullWidth
          rowsMax={4}
          value={comment}
          onChange={handleCommentChange}
          variant="outlined"
        />{" "}
      </div>
    </div>
  );
}

function IntroductionSection() {
  const classes = useStyles();

  return (
    <div>
      <div className={classes.title}>
        <img
          className={classes.logo}
          src="ltl-logo.jpg"
          alt="Learning Through Landscapes logo"
        />
        <h1>The Outdoor Learning and Play Audit Tool</h1>
      </div>
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
        everyone to write on a flip chart or 'stickies' what lesson(s) they lead
        outdoors each academic year.
      </p>

      <p>
        If you don't currently make good use of local greenspace for outdoor
        learning then we suggest that before completing section 7 you should
        visit your nearest area that has potential for learning and play to get
        a better feel for the space. Again, you should check with all colleagues
        in case you are not aware of all the local trips that are happening. Use
        the same session and tool to ask all staff what local sessions they lead
        each year.
      </p>

      <p>
        Most of the 'questions' you will answer are actually statements - which
        you have to respond to on the following scale:
      </p>
      <ExampleQuestion />
      <p>
        Use the comment icon to provide a space for any notes or comments that
        you want to make.
      </p>
      <p>
        The results of this audit are for you to then use - we hope it sparks
        thoughts and visits themes you are not aware of.
      </p>
    </div>
  );
}

export default IntroductionSection;
