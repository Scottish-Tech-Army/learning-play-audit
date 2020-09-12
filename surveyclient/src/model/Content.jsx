import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import CommentIcon from "@material-ui/icons/Comment";
import CommentOutlinedIcon from "@material-ui/icons/CommentOutlined";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import {
  SCALE_WITH_COMMENT,
  TEXT,
  TEXT_INLINE_LABEL,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
} from "./QuestionTypes";

// Update the version when any changes are made to the survey. Use semantic versioning.
export const SURVEY_VERSION = "0.9.0";

// For each of the sections, provide a content function that takes a addQuestion(SCALE_WITH_COMMENT,id, text) function as an argument.
// Section uses this to create the React render output for each question, while SurveyModel uses this to gather a list
// of question ids for each section.

export const sectionsContent = [
  {
    number: 1,
    title: "background information",
    id: "background",
    content: (addQuestion) => (
      <>
        {addQuestion(TEXT_INLINE_LABEL, "school", "School")}
        {addQuestion(TEXT_INLINE_LABEL, "localauthority", "Local Authority")}
        {addQuestion(TEXT_INLINE_LABEL, "contactname", "Contact Name")}
        {addQuestion(USER_TYPE_WITH_COMMENT, "position", "Position")}
        {addQuestion(TEXT_INLINE_LABEL, "telephone", "Telephone")}
        {addQuestion(TEXT_INLINE_LABEL, "email", "Email")}
      </>
    ),
  },

  {
    number: 2,
    title: "learning in your grounds",
    id: "learning",
    content: (addQuestion) => (
      <>
        <p>
          There is a good range of features in our grounds to help us teach the
          following curriculum areas:
        </p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "science",
          "science - e.g. water feature, wild areas, bird feeders & boxes, livestock or poultry pens, polytunnel or greenhouse, food growing area, boulders illustrating different rock types etc. "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "maths",
          "maths - e.g. number squares or grids, giant board games, maths trails, themed murals etc. "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "languages",
          "languages - e.g. reading area, themed murals, story telling chair, story trail etc. "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "arts",
          "expressive arts - e.g. stage, amphitheatre, outdoor music, outdoor art etc."
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "RME",
          "RME - e.g. sensory garden, reflection area, themed murals, labyrinth etc. "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "social",
          "social studies - e.g. features that reflect local heritage, themed murals, weather station, food garden etc. "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "technologies",
          "technologies - e.g. wind turbine, solar pannels, use of different materials, sufaces and finishes, web cam bird box, weather station etc. "
        )}
        <p>outdoor classrooms</p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "classroom",
          "We have an outdoor classroom area that can be used by a whole class"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "seating",
          "We have outdoor seating areas for working in smaller groups"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "sheltered",
          "Outdoor classrooms and seating areas are reasonably sheltered and comfortable to use"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "disturbance",
          "Using outdoor classrooms and curriculum features doesn't cause significant disturbance to indoor classes"
        )}
      </>
    ),
  },

  {
    number: 3,
    title: "play",
    id: "play",
    content: (addQuestion) => (
      <>
        <p>active play</p>
        {addQuestion(SCALE_WITH_COMMENT, "climbing", "climbing and scrambling")}
        {addQuestion(SCALE_WITH_COMMENT, "balancing", "balancing")}
        {addQuestion(SCALE_WITH_COMMENT, "swinging", "swinging")}
        {addQuestion(SCALE_WITH_COMMENT, "jumping", "jumping off or between")}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "trails",
          "there are good trails or paths to encourage walking or running"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "slopes",
          "there are slopes and dips to encourage running and rolling "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "physical",
          "there are opportunities for physical challenge and for pupils to assess and manage risk in play"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "markings",
          "there is a good range of game markings painted on the playground"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "targets",
          "there is a good range of goals, targets and hoops to encourage play and sport"
        )}
        <p>imaginative play</p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "grass",
          "areas of uncut grass are accessible for play"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "woodland",
          "if we have areas of woodland or shrubs in school, these are accessible for play"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "bark",
          "children have access to school-grown natural materials for play; berries, cones, bark, twigs, leaves etc."
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "straw",
          "we provide additional natural materials for play; wooden discs, stones, poles, straw etc. "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "soil",
          "children can play in or with soil and mud"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "sand",
          "children can play in or with sand"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "den",
          "children have access to materials and spaces for den-building"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "storage",
          "we have good storage for outdoor play materials"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "trunks",
          "larger tree trunks / logs provide creative play possibilities"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "bushes",
          "bushes, willow tunnels or dens create fun hiding spaces"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "rocks",
          "larger rocks and boulders provide creative play possibilities"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "tyres",
          "children have access to non-natural loose materials for play; tyres, guettering, blankets, milk crates etc. "
        )}
      </>
    ),
  },

  {
    number: 4,
    title: "Wellbeing",
    id: "wellbeing",
    content: (addQuestion) => (
      <>
        <p>social spaces</p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "seating",
          "seating is widely available in our grounds"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "seatingsizes",
          "seating areas cater for different sizes and types of group"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "shelterwind",
          "shelter from wind is widely available outside"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "shelterrain",
          "shelter from rain is widely available outside"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "shade",
          "shade from the sun is widely available outside"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "schoolmeals",
          "pupils or staff can eat their school meals outside in good weather"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "packedlunches",
          "there are facilities for pupils or staff to eat their packed lunches outside"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "socialspaces",
          "there is a wide range of different social spaces that cater for varying group sizes and activities"
        )}
        <p>emotional health</p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "colourful",
          "entrances and signs are colourful, bright, happy and welcoming"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "quiet",
          "staff and pupils have access to attractive outdoor spaces designed for quiet and calm."
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "attractive",
          "trees, shrubs and flowers are used to create an attractive external environment"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "outdoorart",
          "the grounds display a range of attractive outdoor art such as murals, sculpture and mosaics"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "goodimpression",
          "our grounds give a good impression of our school"
        )}
      </>
    ),
  },

  {
    number: 5,
    title: "Sustainability",
    id: "sustainability",
    content: (addQuestion) => (
      <>
        <p>nature</p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "trees",
          "there is a good number of trees of different species and ages"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "flowers",
          "there is a wide range of flowers to encourage wildlife"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "shrubs",
          "there are good areas of shrubs or hedges to encouarge wildlife"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "meadow",
          "we have significant areas of meadow or longer grass"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "ponds",
          "there are water features such as ponds, streams or wetland"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "deadwood",
          "there are log piles or areas of deadwood to encourage insects"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "birdboxes",
          "birdlife is encouraged through use of bird boxes, tables or baths"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "bughotels",
          "we have other facilities to encourage wildlife, such as bug hotels, hedgehog and bat boxes etc."
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "nature",
          "we encourage nature in our grounds in other ways "
        )}
        <p>sustainable practices</p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "cycle",
          "there is ample provision for secure cycle storage"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "composting",
          "there are good composting facilities "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "litterbins",
          "there are enough outdoor litter bins located in the right places"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "renewableenergy",
          "we have renewable energy features of some kind"
        )}
        <p>food</p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "growingfood",
          "there are good facilities for growing food in the grounds"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "fruittrees",
          "there is a good range of fruit trees or bushes"
        )}
      </>
    ),
  },

  {
    number: 6,
    title: "Community and Participation",
    id: "community",
    content: (addQuestion) => (
      <>
        <p>design and creation</p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "pupilsdesign",
          "pupils are actively involved in designing and creating playground improvements "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "parentsdesign",
          "parents and other community members are actively involved in designing and creating playground improvements "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "staffdesign",
          "staff members, both teaching and non-teaching, are actively involved in designing and creating playground improvements "
        )}
        {addQuestion(
          TEXT_WITH_YEAR,
          "datedImprovements",
          "what and when were the 3 most recent playground improvements that pupils have been involved in?"
        )}
        <p>management</p>
        <p>
          pupils are actively involved in managing the following aspects of the
          grounds:
        </p>

        {addQuestion(
          SCALE_WITH_COMMENT,
          "managegrowing",
          "growing and tending"
        )}
        {addQuestion(SCALE_WITH_COMMENT, "managelitter", "litter picking")}
        {addQuestion(SCALE_WITH_COMMENT, "manageother", "other")}
        <p>community use and access</p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "childrenoutside",
          "children are welcome to play in the school grounds outside of school time"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "adultsoutside",
          "adults are welcome to walk or play in the school grounds outside of school time"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "communityoutside",
          "other community organisations [guides, youth clubs etc.] make good use of our grounds outside of school time"
        )}
        {addQuestion(
          TEXT,
          "othercommunity",
          "any other thoughts or comments about about community and participation in your grounds?"
        )}
      </>
    ),
  },

  {
    number: 7,
    title: "Local Greenspace",
    id: "greenspace",
    content: (addQuestion) => (
      <>
        {addQuestion(
          TEXT,
          "namegreenspace",
          "What area of nearby local greenspace has the most potential for regular school use for outdoor learning and play?"
        )}
        <p>
          It will be helpful if you can visit this area with some of your pupils
          to help you fill in the rest of this section. You might also get some
          useful ideas or thoughts from parents with relevant expertise or from
          your local countryside ranger.
        </p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "accessible",
          "This area is readily accessible for regular use by the school"
        )}
        {addQuestion(
          TEXT,
          "improveaccessible",
          "How might you be able to improve its accessibility - for example with a gate, clearing a path, bridging a ditch etc?"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "wildlife",
          "The area is really valuable  for wildlife"
        )}
        {addQuestion(
          TEXT,
          "improvewildlife",
          "How might you improve the area for wildlife?"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "teaching",
          "As it is, the area is a really useful space for teaching and play"
        )}
        {addQuestion(
          TEXT,
          "improveteaching",
          "How could it be made more useful for teaching and play?"
        )}
        {addQuestion(TEXT, "listowner", "Who owns this area of land?")}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "changes",
          "Will it be straightforward to agree any changes you'd like to make with the land owner?"
        )}
      </>
    ),
  },

  {
    number: 8,
    title: "Your Practice",
    id: "practice",
    content: (addQuestion) => (
      <>
        <p>learning</p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "developingcurriculum",
          "the school improvement plan includes developing  curriculum learning and / or play outdoors"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "curriculumtopic",
          "on average, most teachers will teach a curriculum topic outdoors at least once a month. "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "resources",
          "we have pre-prepared resources that we can take outdoors to support a wide range of curriculum learning "
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "outcomes",
          "outdoor lessons have clearly specified curriculum outcomes that we are able to assess"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "principles",
          "our outdoor learning programme is planned with reference to the CfE principles for curriculum design"
        )}
        {addQuestion(SCALE_WITH_COMMENT, "growfood", "we grow food in school")}
        <p>play</p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "playpolicy",
          "our school has a play policy"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "playrain",
          "pupils are allowed to play outside in light rain if they wish"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "playsnow",
          "pupils are allowed to play outide in snowy or icy weather if they wish"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "allages",
          "children of all ages can mix and play together in some areas if they wish"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "outofsight",
          "chidren are allowed to play out of sight of supervisors - for example behind trees or in bushes"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "typesofplay",
          "the playground is zoned to cater for different types of play: active, quiet, creative etc."
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "monitoring",
          "pupils are invovled in agreeing and monitoring playground rules and behaviour"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "skillstraining",
          "playground supervisors have had basic play skills training"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "oldersupervising",
          "older children play an active role in supporting and supervising play"
        )}
      </>
    ),
  },

  {
    number: 9,
    title: "your reflection and feedback",
    id: "reflection",
    content: (addQuestion) => (
      <>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "groundsadvisor",
          "If there was a school grounds advisor available in this area then would you make use of them in your school?"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "onlineresources",
          "Would it be helpful to have online information and resources on how to develop some of the ideas suggested in this audit?"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "CPD",
          "CPD on how to develop some of the ideas suggested in this audit would be really useful"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "straightforward",
          "Would you say it was fairly straightforward to answer the questions in this audit?"
        )}
        {addQuestion(
          SCALE_WITH_COMMENT,
          "ideas",
          "Would you say that the process of completing this audit has given you some ideas for how to improve your outdoor learning and play provision?"
        )}
      </>
    ),
  },
];

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

export const introduction = (
  <div>
    <img src="ltl-logo.jpg" alt="Learning Through Landscapes logo" />
    <h1>The Outdoor Learning and Play Audit Tool</h1>

    <p>
      This audit tool was developed by Grounds for Learning to help you reflect
      on your current outdoor spaces and practice, so that you can identify
      priorities for development that might be supported by the School
      Development Plan, colleagues and yourself.
    </p>

    <p>
      You should be able to complete most of the audit in around an hour - using
      your existing knowledge and without the need to collect any additional
      information. In a large school you may not yet be aware of all the uses of
      the outdoor space for learning, and so we suggest you ask for input from
      all teachers into this. A simple way is to ask everyone to write on a flip
      chart or 'stickies' what lesson(s) they lead outdoors each academic year.
    </p>

    <p>
      If you don't currently make good use of local greenspace for outdoor
      learning then we suggest that before completing section 7 you should visit
      your nearest area that has potential for learning and play to get a better
      feel for the space. Again, you should check with all colleagues in case
      you are not aware of all the local trips that are happening. Use the same
      session and tool to ask all staff what local sessions they lead each year.
    </p>

    <p>
      Most of the 'questions' you will answer are actually statements - which
      you have to respond to on the following scale:
    </p>
    <ExampleQuestion />
    <p>
      Use the comment icon to provide a space for any notes or comments that you
      want to make.
    </p>
    <p>
      The results of this audit are for you to then use - we hope it sparks
      thoughts and visits themes you are not aware of.
    </p>
  </div>
);