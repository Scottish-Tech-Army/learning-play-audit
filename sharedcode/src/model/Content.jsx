// Survey content Copyright 2020 Learning Through Landscapes https://www.ltl.org.uk/

import React from "react";

// Update the version when any changes are made to the survey. Use semantic versioning.
export const SURVEY_VERSION = "0.9.0";

export const BACKGROUND = "background";

export const SCALE_WITH_COMMENT = "scaleWithComment";
export const USER_TYPE_WITH_COMMENT = "userTypeWithComment";
export const TEXT_AREA = "textArea";
export const TEXT_FIELD = "textField";
export const TEXT_WITH_YEAR = "textWithYear";

// For each of the sections, provide a content function that takes a addQuestion(SCALE_WITH_COMMENT,id, text) function as an argument.
// Section uses this to create the React render output for each question, while SurveyModel uses this to gather a list
// of question ids for each section.

export const sectionsContent = [
  {
    number: 1,
    title: "Background Information",
    id: BACKGROUND,
    content: (addQuestion) => (
      <>
        {addQuestion(TEXT_FIELD, "school", "School")}
        {addQuestion(TEXT_FIELD, "localauthority", "Local Authority")}
        {addQuestion(TEXT_FIELD, "contactname", "Contact Name")}
        {addQuestion(USER_TYPE_WITH_COMMENT, "position", "Position")}
        {addQuestion(TEXT_FIELD, "telephone", "Telephone")}
      </>
    ),
  },

  {
    number: 2,
    title: "Learning in Your Grounds",
    id: "learning",
    content: (addQuestion) => (
      <>
        <p>
          <b>
            There is a good range of features in our grounds to help us teach
            the following curriculum areas:
          </b>
        </p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "science",
          <>
            <b>science</b> - e.g. water feature, wild areas, bird feeders &
            boxes, livestock or poultry pens, polytunnel or greenhouse, food
            growing area, boulders illustrating different rock types etc.
          </>
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "maths",
          <>
            <b>maths</b> - e.g. number squares or grids, giant board games,
            maths trails, themed murals etc.
          </>
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "languages",
          <>
            <b>languages</b> - e.g. reading area, themed murals, story telling
            chair, story trail etc.
          </>
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "arts",
          <>
            <b>expressive arts</b> - e.g. stage, amphitheatre, outdoor music,
            outdoor art etc.
          </>
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "RME",
          <>
            <b>RME</b> - e.g. sensory garden, reflection area, themed murals,
            labyrinth etc.
          </>
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "social",
          <>
            <b>social studies</b> - e.g. features that reflect local heritage,
            themed murals, weather station, food garden etc.
          </>
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "technologies",
          <>
            <b>technologies</b> - e.g. wind turbine, solar pannels, use of
            different materials, sufaces and finishes, web cam bird box, weather
            station etc.
          </>
        )}
        <hr className="subsection-divider" />
        <h2>Outdoor Classrooms</h2>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "classroom",
          "we have an outdoor classroom area that can be used by a whole class"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "seating",
          "we have outdoor seating areas for working in smaller groups"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "sheltered",
          "outdoor classrooms and seating areas are reasonably sheltered and comfortable to use"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "disturbance",
          "using outdoor classrooms and curriculum features doesn't cause significant disturbance to indoor classes"
        )}
      </>
    ),
  },

  {
    number: 3,
    title: "Play",
    id: "play",
    content: (addQuestion) => (
      <>
        <h2>Active Play</h2>
        {addQuestion(SCALE_WITH_COMMENT, "climbing", "climbing and scrambling")}
        <hr className="question-divider" />
        {addQuestion(SCALE_WITH_COMMENT, "balancing", "balancing")}
        <hr className="question-divider" />
        {addQuestion(SCALE_WITH_COMMENT, "swinging", "swinging")}
        <hr className="question-divider" />
        {addQuestion(SCALE_WITH_COMMENT, "jumping", "jumping off or between")}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "trails",
          "there are good trails or paths to encourage walking or running"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "slopes",
          "there are slopes and dips to encourage running and rolling "
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "physical",
          "there are opportunities for physical challenge and for pupils to assess and manage risk in play"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "markings",
          "there is a good range of game markings painted on the playground"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "targets",
          "there is a good range of goals, targets and hoops to encourage play and sport"
        )}
        <hr className="subsection-divider" />
        <h2>Imaginative Play</h2>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "grass",
          "areas of uncut grass are accessible for play"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "woodland",
          "if we have areas of woodland or shrubs in school, these are accessible for play"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "bark",
          "children have access to school-grown natural materials for play; berries, cones, bark, twigs, leaves etc."
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "straw",
          "we provide additional natural materials for play; wooden discs, stones, poles, straw etc. "
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "soil",
          "children can play in or with soil and mud"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "sand",
          "children can play in or with sand"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "den",
          "children have access to materials and spaces for den-building"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "storage",
          "we have good storage for outdoor play materials"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "trunks",
          "larger tree trunks / logs provide creative play possibilities"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "bushes",
          "bushes, willow tunnels or dens create fun hiding spaces"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "rocks",
          "larger rocks and boulders provide creative play possibilities"
        )}
        <hr className="question-divider" />
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
        <h2>Social Spaces</h2>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "seating",
          "seating is widely available in our grounds",
          2
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "seatingsizes",
          "seating areas cater for different sizes and types of group"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "shelterwind",
          "shelter from wind is widely available outside"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "shelterrain",
          "shelter from rain is widely available outside"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "shade",
          "shade from the sun is widely available outside"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "schoolmeals",
          "pupils or staff can eat their school meals outside in good weather"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "packedlunches",
          "there are facilities for pupils or staff to eat their packed lunches outside"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "socialspaces",
          "there is a wide range of different social spaces that cater for varying group sizes and activities",
          2
        )}
        <hr className="subsection-divider" />
        <h2>Emotional Health</h2>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "colourful",
          "entrances and signs are colourful, bright, happy and welcoming"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "quiet",
          "staff and pupils have access to attractive outdoor spaces designed for quiet and calm.",
          2
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "attractive",
          "trees, shrubs and flowers are used to create an attractive external environment"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "outdoorart",
          "the grounds display a range of attractive outdoor art such as murals, sculpture and mosaics"
        )}
        <hr className="question-divider" />
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
        <h2>Nature</h2>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "trees",
          "there is a good number of trees of different species and ages"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "flowers",
          "there is a wide range of flowers to encourage wildlife"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "shrubs",
          "there are good areas of shrubs or hedges to encouarge wildlife"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "meadow",
          "we have significant areas of meadow or longer grass"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "ponds",
          "there are water features such as ponds, streams or wetland"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "deadwood",
          "there are log piles or areas of deadwood to encourage insects"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "birdboxes",
          "birdlife is encouraged through use of bird boxes, tables or baths"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "bughotels",
          "we have other facilities to encourage wildlife, such as bug hotels, hedgehog and bat boxes etc."
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "nature",
          "we encourage nature in our grounds in other ways "
        )}
        <hr className="subsection-divider" />
        <h2>Sustainable Practices</h2>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "cycle",
          "there is ample provision for secure cycle storage"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "composting",
          "there are good composting facilities "
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "litterbins",
          "there are enough outdoor litter bins located in the right places"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "renewableenergy",
          "we have renewable energy features of some kind"
        )}
        <hr className="subsection-divider" />
        <h2>Food</h2>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "growingfood",
          "there are good facilities for growing food in the grounds"
        )}
        <hr className="question-divider" />
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
        <h2>Design and Creation</h2>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "pupilsdesign",
          "pupils are actively involved in designing and creating playground improvements "
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "parentsdesign",
          "parents and other community members are actively involved in designing and creating playground improvements "
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "staffdesign",
          "staff members, both teaching and non-teaching, are actively involved in designing and creating playground improvements "
        )}
        <hr className="question-divider" />
        {addQuestion(
          TEXT_WITH_YEAR,
          "datedImprovements",
          "what and when were the 3 most recent playground improvements that pupils have been involved in?"
        )}
        <hr className="subsection-divider" />
        <h2>Management</h2>
        <p>
          pupils are actively involved in <b>managing</b> the following aspects
          of the grounds:
        </p>

        {addQuestion(
          SCALE_WITH_COMMENT,
          "managegrowing",
          "growing and tending"
        )}
        <hr className="question-divider" />
        {addQuestion(SCALE_WITH_COMMENT, "managelitter", "litter picking")}
        <hr className="question-divider" />
        {addQuestion(SCALE_WITH_COMMENT, "manageother", "other")}
        <hr className="subsection-divider" />
        <h2>Community Use and Access</h2>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "childrenoutside",
          "children are welcome to play in the school grounds outside of school time"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "adultsoutside",
          "adults are welcome to walk or play in the school grounds outside of school time"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "communityoutside",
          "other community organisations [guides, youth clubs etc.] make good use of our grounds outside of school time",
          0.5
        )}
        <hr className="question-divider" />
        {addQuestion(
          TEXT_AREA,
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
          TEXT_AREA,
          "namegreenspace",
          "what area of nearby local greenspace has the most potential for regular school use for outdoor learning and play?"
        )}
        <hr className="subsection-divider" />
        <p>
          <b>
            It will be helpful if you can visit this area with some of your
            pupils to help you fill in the rest of this section. You might also
            get some useful ideas or thoughts from parents with relevant
            expertise or from your local countryside ranger.
          </b>
        </p>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "accessible",
          "this area is readily accessible for regular use by the school"
        )}
        <hr className="question-divider" />
        {addQuestion(
          TEXT_AREA,
          "improveaccessible",
          "how might you be able to improve its accessibility - for example with a gate, clearing a path, bridging a ditch etc?"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "frequentuse",
          "the school uses this space alot (e.g. at least monthly)"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "wildlife",
          "the area is really valuable for wildlife"
        )}
        <hr className="question-divider" />
        {addQuestion(
          TEXT_AREA,
          "improvewildlife",
          "how might you improve the area for wildlife?"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "teaching",
          "as it is, the area is a really useful space for teaching and play"
        )}
        <hr className="question-divider" />
        {addQuestion(
          TEXT_AREA,
          "improveteaching",
          "how could it be made more useful for teaching and play?"
        )}
        <hr className="question-divider" />
        {addQuestion(TEXT_AREA, "listowner", "who owns this area of land?")}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "changes",
          "will it be straightforward to agree any changes you'd like to make with the land owner?"
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
        <h2>Learning</h2>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "developingcurriculum",
          "the school improvement plan includes developing  curriculum learning and / or play outdoors"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "curriculumtopic",
          "on average, most teachers will teach a curriculum topic outdoors at least once a month. "
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "resources",
          "we have pre-prepared resources that we can take outdoors to support a wide range of curriculum learning "
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "outcomes",
          "outdoor lessons have clearly specified curriculum outcomes that we are able to assess"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "principles",
          "our outdoor learning programme is planned with reference to the CfE principles for curriculum design"
        )}
        <hr className="question-divider" />
        {addQuestion(SCALE_WITH_COMMENT, "growfood", "we grow food in school")}
        <hr className="subsection-divider" />
        <h2>Play</h2>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "playpolicy",
          "our school has a play policy"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "playrain",
          "pupils are allowed to play outside in light rain if they wish"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "playsnow",
          "pupils are allowed to play outide in snowy or icy weather if they wish"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "allages",
          "children of all ages can mix and play together in some areas if they wish"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "outofsight",
          "chidren are allowed to play out of sight of supervisors - for example behind trees or in bushes"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "typesofplay",
          "the playground is zoned to cater for different types of play: active, quiet, creative etc."
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "monitoring",
          "pupils are invovled in agreeing and monitoring playground rules and behaviour"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "skillstraining",
          "playground supervisors have had basic play skills training"
        )}
        <hr className="question-divider" />
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
    title: "Your Reflection and Feedback",
    id: "reflection",
    content: (addQuestion) => (
      <>
        {addQuestion(
          SCALE_WITH_COMMENT,
          "groundsadvisor",
          "if there was a school grounds advisor available in this area then would you make use of them in your school?"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "onlineresources",
          "would it be helpful to have online information and resources on how to develop some of the ideas suggested in this audit?"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "CPD",
          "CPD on how to develop some of the ideas suggested in this audit would be really useful"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "straightforward",
          "would you say it was fairly straightforward to answer the questions in this audit?"
        )}
        <hr className="question-divider" />
        {addQuestion(
          SCALE_WITH_COMMENT,
          "ideas",
          "would you say that the process of completing this audit has given you some ideas for how to improve your outdoor learning and play provision?"
        )}
      </>
    ),
  },
];

function createSectionsContentMap() {
  const result = new Map();
  sectionsContent.forEach((item, i) => {
    result.set(item.id, item);
  });
  return result;
}

export const sectionsContentMap = createSectionsContentMap();
