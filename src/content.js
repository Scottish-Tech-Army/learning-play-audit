import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import CommentIcon from "@material-ui/icons/Comment";
import CommentOutlinedIcon from "@material-ui/icons/CommentOutlined";
import IconButton from "@material-ui/core/IconButton";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "./ActionTypes.js";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import { makeStyles, withStyles } from "@material-ui/core/styles";

export const content = {
  sections: [
    {
      number: 2,
      title: "learning in your grounds",
      id: "learning",
      summary:
        "There is a good range of features in our grounds to help us teach the following curriculum areas:",
      questions: [
        {
          id: "science",
          text:
            "science - e.g. water feature, wild areas, bird feeders & boxes, livestock or poultry pens, polytunnel or greenhouse, food growing area, boulders illustrating different rock types etc. ",
        },
        {
          id: "maths",
          text:
            "maths - e.g. number squares or grids, giant board games, maths trails, themed murals etc. ",
        },
        {
          id: "languages",
          text:
            "languages - e.g. reading area, themed murals, story telling chair, story trail etc. ",
        },
        {
          id: "arts",
          text:
            "expressive arts - e.g. stage, amphitheatre, outdoor music, outdoor art etc.",
        },
        {
          id: "RME",
          text:
            "RME - e.g. sensory garden, reflection area, themed murals, labyrinth etc. ",
        },
        {
          id: "social",
          text:
            "social studies - e.g. features that reflect local heritage, themed murals, weather station, food garden etc. ",
        },
        {
          id: "technologies",
          text:
            "technologies - e.g. wind turbine, solar pannels, use of different materials, sufaces and finishes, web cam bird box, weather station etc. ",
        },
        {
          id: "classroom",
          text:
            "We have an outdoor classroom area that can be used by a whole class",
        },
        {
          id: "seating",
          text: "We have outdoor seating areas for working in smaller groups",
        },
        {
          id: "sheltered",
          text:
            "Outdoor classrooms and seating areas are reasonably sheltered and comfortable to use",
        },
        {
          id: "disturbance",
          text:
            "Using outdoor classrooms and curriculum features doesn't cause significant disturbance to indoor classes",
        },
      ],
    },

    {
      number: 3,
      title: "play",
      id: "play",
      questions: [
        {
          id: "climbing",
          text: "climbing and scrambling",
        },
        {
          id: "balancing",
          text: "balancing",
        },
        {
          id: "swinging",
          text: "swinging",
        },
        {
          id: "jumping",
          text: "jumping off or between",
        },
        {
          id: "trails",
          text:
            "there are good trails or paths to encourage walking or running",
        },
        {
          id: "slopes",
          text: "there are slopes and dips to encourage running and rolling ",
        },
        {
          id: "physical",
          text:
            "there are opportunities for physical challenge and for pupils to assess and manage risk in play",
        },
        {
          id: "markings",

          text:
            "there is a good range of game markings painted on the playground",
        },
        {
          id: "targets",
          text:
            "there is a good range of goals, targets and hoops to encourage play and sport",
        },
        {
          id: "grass",
          text: "areas of uncut grass are accessible for play",
        },
        {
          id: "woodland",
          text:
            "if we have areas of woodland or shrubs in school, these are accessible for play",
        },
        {
          id: "bark",
          text:
            "children have access to school-grown natural materials for play; berries, cones, bark, twigs, leaves etc.",
        },
        {
          id: "straw",
          text:
            "we provide additional natural materials for play; wooden discs, stones, poles, straw etc. ",
        },
        {
          id: "soil",
          text: "children can play in or with soil and mud",
        },
        {
          id: "sand",
          text: "children can play in or with sand",
        },
        {
          id: "den",
          text: "children have access to materials and spaces for den-building",
        },
        {
          id: "storage",
          text: "we have good storage for outdoor play materials",
        },
        {
          id: "trunks",
          text: "larger tree trunks / logs provide creative play possibilities",
        },
        {
          id: "bushes",
          text: "bushes, willow tunnels or dens create fun hiding spaces",
        },
        {
          id: "rocks",
          text: "larger rocks and boulders provide creative play possibilities",
        },
        {
          id: "tyres",
          text:
            "children have access to non-natural loose materials for play; tyres, guettering, blankets, milk crates etc. ",
        },
      ],
    },

    {
      number: 4,
      title: "Wellbeing",
      id: "wellbeing",
      questions: [
        {
          id: "seating",
          text: "seating is widely available in our grounds",
        },
        {
          id: "seatingsizes",
          text: "seating areas cater for different sizes and types of group",
        },
        {
          id: "shelterwind",
          text: "shelter from wind is widely available outside",
        },
        {
          id: "shelterrain",
          text: "shelter from rain is widely available outside",
        },
        {
          id: "shade",
          text: "shade from the sun is widely available outside",
        },
        {
          id: "schoolmeals",
          text:
            "pupils or staff can eat their school meals outside in good weather",
        },
        {
          id: "packedlunches",
          text:
            "there are facilities for pupils or staff to eat their packed lunches outside",
        },
        {
          id: "socialspaces",
          text:
            "there is a wide range of different social spaces that cater for varying group sizes and activities",
        },
        {
          id: "colourful",
          text:
            "entrances and signs are colourful, bright, happy and welcoming",
        },
        {
          id: "quiet",
          text:
            "staff and pupils have access to attractive outdoor spaces designed for quiet and calm.",
        },
        {
          id: "attractive",
          text:
            "trees, shrubs and flowers are used to create an attractive external environment",
        },
        {
          id: "outdoorart",
          text:
            "the grounds display a range of attractive outdoor art such as murals, sculpture and mosaics",
        },
        {
          id: "goodimpression",
          text: "our grounds give a good impression of our school",
        },
      ],
    },

    {
      number: 5,
      title: "Sustainability",
      id: "sustainability",
      questions: [
        {
          id: "trees",
          text: "there is a good number of trees of different species and ages",
        },
        {
          id: "flowers",
          text: "there is a wide range of flowers to encourage wildlife",
        },
        {
          id: "shrubs",
          text:
            "there are good areas of shrubs or hedges to encouarge wildlife",
        },
        {
          id: "meadow",
          text: "we have significant areas of meadow or longer grass",
        },
        {
          id: "ponds",
          text: "there are water features such as ponds, streams or wetland",
        },
        {
          id: "deadwood",
          text: "there are log piles or areas of deadwood to encourage insects",
        },
        {
          id: "birdboxes",
          text:
            "birdlife is encouraged through use of bird boxes, tables or baths",
        },
        {
          id: "bughotels",
          text:
            "we have other facilities to encourage wildlife, such as bug hotels, hedgehog and bat boxes etc.",
        },
        {
          id: "nature",
          text: "we encourage nature in our grounds in other ways ",
        },
        {
          id: "cycle",
          text: "there is ample provision for secure cycle storage",
        },
        {
          id: "composting",
          text: "there are good composting facilities ",
        },
        {
          id: "litterbins",
          text:
            "there are enough outdoor litter bins located in the right places",
        },
        {
          id: "renewableenergy",
          text: "we have renewable energy features of some kind",
        },
        {
          id: "growingfood",
          text: "there are good facilities for growing food in the grounds",
        },
        {
          id: "fruittrees",
          text: "there is a good range of fruit trees or bushes",
        },
      ],
    },

    {
      number: 6,
      title: "Community and Participation",
      id: "community",
      questions: [
        {
          id: "pupilsdesign",
          text:
            "pupils are actively involved in designing and creating playground improvements ",
        },
        {
          id: "parentsdesign",
          text:
            "parents and other community members are actively involved in designing and creating playground improvements ",
        },
        {
          id: "staffdesign",
          text:
            "staff members, both teaching and non-teaching, are actively involved in designing and creating playground improvements ",
        },
        {
          id: "managegrowing",
          text: "growing and tending",
        },
        {
          id: "managelitter",
          text: "litter picking",
        },
        {
          id: "manageother",
          text: "other",
        },
        {
          id: "childrenoutside",
          text:
            "children are welcome to play in the school grounds outside of school time",
        },
        {
          id: "adultsoutside",
          text:
            "adults are welcome to walk or play in the school grounds outside of school time",
        },
        {
          id: "communityoutside",
          text:
            "other community organisations [guides, youth clubs etc.] make good use of our grounds outside of school time",
        },
      ],
    },

    {
      number: 7,
      title: "Local Greenspace",
      id: "greenspace",
      questions: [
        {
          id: "accessible",
          text: "This area is readily accessible for regular use by the school",
        },
        {
          id: "wildlife",
          text: "The area is really valuable  for wildlife",
        },
        {
          id: "teaching",
          text:
            "As it is, the area is a really useful space for teaching and play",
        },
        {
          id: "changes",
          text:
            "Will it be straightforward to agree any changes you'd like to make with the land owner?",
        },
      ],
    },

    {
      number: 8,
      title: "Your Practice",
      id: "practice",
      questions: [
        {
          id: "developingcurriculum",
          text:
            "the school improvement plan includes developing  curriculum learning and / or play outdoors",
        },
        {
          id: "curriculumtopic",
          text:
            "on average, most teachers will teach a curriculum topic outdoors at least once a month. ",
        },
        {
          id: "resources",
          text:
            "we have pre-prepared resources that we can take outdoors to support a wide range of curriculum learning ",
        },
        {
          id: "outcomes",
          text:
            "outdoor lessons have clearly specified curriculum outcomes that we are able to assess",
        },
        {
          id: "principles",
          text:
            "our outdoor learning programme is planned with reference to the CfE principles for curriculum design",
        },
        {
          id: "growfood",
          text: "we grow food in school",
        },
        {
          id: "playpolicy",
          text: "our school has a play policy",
        },
        {
          id: "playrain",
          text: "pupils are allowed to play outside in light rain if they wish",
        },
        {
          id: "playsnow",
          text:
            "pupils are allowed to play outide in snowy or icy weather if they wish",
        },
        {
          id: "allages",
          text:
            "children of all ages can mix and play together in some areas if they wish",
        },
        {
          id: "outofsight",
          text:
            "chidren are allowed to play out of sight of supervisors - for example behind trees or in bushes",
        },
        {
          id: "typesofplay",
          text:
            "the playground is zoned to cater for different types of play: active, quiet, creative etc.",
        },
        {
          id: "monitoring",
          text:
            "pupils are invovled in agreeing and monitoring playground rules and behaviour",
        },
        {
          id: "skillstraining",
          text: "playground supervisors have had basic play skills training",
        },
        {
          id: "oldersupervising",
          text:
            "older children play an active role in supporting and supervising play",
        },
      ],
    },

    {
      number: 9,
      title: "your reflection and feedback",
      id: "reflection",
      questions: [
        {
          id: "groundsadvisor",
          text:
            "If there was a school grounds advisor available in this area then would you make use of them in your school?",
        },
        {
          id: "onlineresources",
          text:
            "Would it be helpful to have online information and resources on how to develop some of the ideas suggested in this audit?",
        },
        {
          id: "CPD",
          text:
            "CPD on how to develop some of the ideas suggested in this audit would be really useful",
        },
        {
          id: "straightforward",
          text:
            "Would you say it was fairly straightforward to answer the questions in this audit?",
        },
        {
          id: "ideas",
          text:
            "Would you say that the process of completing this audit has given you some ideas for how to improve your outdoor learning and play provision?",
        },
      ],
    },
  ],
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
    flexGrow: 1,
    textAlign: "start",
  },
  title: {
    flexGrow: 1,
  },
  circularProgressWithLabel: {
    marginRight: "10px",
  },
  actionRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
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
    <div className="">
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
      <div className={showComment ? "commentbox" : "commentbox-hidden"}>
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
      Use the comment icon on the right to provide a space for any notes or
      comments that you want to make.
    </p>
    <p>
      The results of this audit are for you to then use - we hope it sparks
      thoughts and visits themes you are not aware of.
    </p>
  </div>
);
