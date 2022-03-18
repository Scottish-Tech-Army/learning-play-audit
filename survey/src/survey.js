// Survey content Copyright 2020 Learning through Landscapes https://www.ltl.org.uk/

// Update the version when any changes are made to the survey. Use semantic versioning.
export const SURVEY_VERSION = "0.10.0";

export const BACKGROUND = "background";
export const SCALE_WITH_COMMENT = "scaleWithComment";
export const USER_TYPE_WITH_COMMENT = "userTypeWithComment";
export const TEXT_AREA = "textArea";
export const TEXT_FIELD = "textField";
export const TEXT_WITH_YEAR = "textWithYear";

export const sectionsContent = [
  {
    number: 1,
    title: "Background Information",
    id: BACKGROUND,
    subsections: [
      {
        questions: [
          { type: TEXT_FIELD, id: "school", text: "School" },
          { type: TEXT_FIELD, id: "localauthority", text: "Local Authority" },
          { type: TEXT_FIELD, id: "contactname", text: "Contact Name" },
          { type: USER_TYPE_WITH_COMMENT, id: "position", text: "Position" },
          { type: TEXT_FIELD, id: "telephone", text: "Telephone" },
        ],
      },
    ],
  },
  {
    number: 2,
    title: "Learning in Your Grounds",
    id: "learning",
    subsections: [
      {
        title: {
          tag: "p",
          content: {
            tag: "b",
            content:
              "There is a good range of features in our grounds to help us teach the following curriculum areas:",
          },
        },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "science",
            text: [
              { tag: "b", content: "science" },
              " - e.g. water feature, wild areas, bird feeders & boxes, livestock or poultry pens, polytunnel or greenhouse, food growing area, boulders illustrating different rock types etc.",
            ],
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "maths",
            text: [
              { tag: "b", content: "maths" },
              " - e.g. number squares or grids, giant board games, maths trails, themed murals etc.",
            ],
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "languages",
            text: [
              { tag: "b", content: "languages" },
              " - e.g. reading area, themed murals, story telling chair, story trail etc.",
            ],
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "arts",
            text: [
              { tag: "b", content: "expressive arts" },
              " - e.g. stage, amphitheatre, outdoor music, outdoor art etc.",
            ],
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "RME",
            text: [
              { tag: "b", content: "RME/RMPS" },
              " - e.g. sensory garden, reflection area, themed murals, labyrinth etc.",
            ],
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "social",
            text: [
              { tag: "b", content: "social studies" },
              " - e.g. features that reflect local heritage, themed murals, weather station, food garden etc.",
            ],
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "technologies",
            text: [
              { tag: "b", content: "technologies" },
              " - e.g. wind turbine, solar panels, use of different materials, surfaces and finishes, web cam bird box, weather station etc.",
            ],
          },
        ],
      },

      {
        title: {
          tag: "h2",
          content: "Outdoor Gathering Spaces",
        },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "classroom",
            text: "We have an outdoor gathering space that can be used by a whole class.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "seating",
            text: "We have outdoor seating areas for working in smaller groups.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "sheltered",
            text: "Outdoor gathering spaces and seating areas are reasonably sheltered and comfortable to use.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "disturbance",
            text: "The places you use for gathering a class or learning outdoors don’t cause significant disturbance to indoor classes.",
          },
        ],
      },
    ],
  },
  {
    number: 3,
    title: "Play in Your Grounds",
    id: "play",

    subsections: [
      {
        title: [
          { tag: "h2", content: "Active Play" },
          {
            tag: "p",
            content:
              "What opportunities for the following play activities are there in your grounds?",
          },
        ],

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "climbing",
            text: "Climbing and scrambling.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "balancing",
            text: "Balancing.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "swinging",
            text: "Swinging.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "jumping",
            text: "Jumping off or between.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "trails",
            text: "There are good trails or paths to encourage walking or running.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "slopes",
            text: "There are slopes and dips to encourage running and rolling.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "physical",
            text: "There are opportunities for physical challenge and for pupils to assess and manage risk in play.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "markings",
            text: "There is a good range of game markings painted on the playground.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "targets",
            text: "There is a good range of goals, targets and hoops to encourage play and sport.",
          },
        ],
      },

      {
        title: { tag: "h2", content: "Imaginative Play" },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "grass",
            text: "Areas of uncut grass are accessible for play.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "woodland",
            text: "If we have areas of woodland or shrubs in school, these are accessible for play.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "bark",
            text: "Children have access to school-grown natural materials for play: berries, cones, bark, twigs, leaves etc.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "straw",
            text: "We provide additional natural materials for play: wooden discs, stones, poles, straw etc.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "soil",
            text: "Children can play in or with soil and mud.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "sand",
            text: "Children can play in or with sand.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "den",
            text: "Children have access to materials and spaces for den-building.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "storage",
            text: "We have good storage for outdoor play materials.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "trunks",
            text: "Larger tree trunks / logs provide creative play possibilities.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "bushes",
            text: "Bushes, willow tunnels or dens create fun hiding spaces.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "rocks",
            text: "Larger rocks and boulders provide creative play possibilities.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "tyres",
            text: "Children have access to non-natural loose materials for play: tyres, guttering, blankets, milk crates etc.",
          },
        ],
      },
    ],
  },
  {
    number: 4,
    title: "Wellbeing",
    id: "wellbeing",
    subsections: [
      {
        title: { tag: "h2", content: "Social Spaces" },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "seating",
            text: "Seating is widely available in our grounds.",
            weight: 2,
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "seatingsizes",
            text: "Seating areas cater for different sizes and types of group.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "shelterwind",
            text: "Shelter from wind is widely available outside.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "shelterrain",
            text: "Shelter from rain is widely available outside.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "shade",
            text: "Shade from the sun is widely available outside.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "schoolmeals",
            text: "Pupils or staff can eat their school meals outside in good weather.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "packedlunches",
            text: "There are facilities for pupils or staff to eat their packed lunches outside.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "socialspaces",
            text: "There is a wide range of different social spaces that cater for varying group sizes and activities.",
            weight: 2,
          },
        ],
      },

      {
        title: { tag: "h2", content: "Emotional Health" },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "colourful",
            text: "Entrances and signs are colourful, bright, happy and welcoming.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "quiet",
            text: "Staff and pupils have access to attractive outdoor spaces designed for quiet and calm.",
            weight: 2,
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "attractive",
            text: "Trees, shrubs and flowers are used to create an attractive external environment.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "outdoorart",
            text: "The grounds display a range of attractive outdoor art such as murals, sculpture and mosaics.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "goodimpression",
            text: "Our grounds give a good impression of our school.",
          },
        ],
      },
    ],
  },
  {
    number: 5,
    title: "Sustainability",
    id: "sustainability",
    subsections: [
      {
        title: { tag: "h2", content: "Nature" },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "trees",
            text: "There is a good number of trees of different species and ages.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "flowers",
            text: "There is a wide range of flowers to encourage wildlife.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "shrubs",
            text: "There are good areas of shrubs or hedges to encourage wildlife.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "meadow",
            text: "We have significant areas of meadow or longer grass.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "ponds",
            text: "There are water features such as ponds, streams or wetland.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "deadwood",
            text: "There are log piles or areas of deadwood to encourage insects.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "birdboxes",
            text: "Birdlife is encouraged through use of bird boxes, tables or baths.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "bughotels",
            text: "We have other facilities to encourage wildlife, such as bug hotels, hedgehog and bat boxes etc.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "nature",
            text: "We encourage nature in our grounds in other ways.",
          },
        ],
      },

      {
        title: {
          tag: "h2",
          content: "Sustainable Practice and Climate Change",
        },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "cycle",
            text: "There is ample provision for secure cycle storage.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "composting",
            text: "There are good composting facilities.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "litterbins",
            text: "There are enough outdoor litter bins located in the right places.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "renewableenergy",
            text: "We have renewable energy features of some kind.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "overheating",
            text: "We have features that address overheating in our grounds. (This includes such things as shade from natural or man made items, natural surfaces and running water.)",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "airquality",
            text: "Our air quality is good. (This is because we are away from pollution sources such as roads and factories and/or we have mitigating features such as planting or running water.)",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "heavyrain",
            text: "Our grounds have features to help manage heavy rain or drought conditions. (Items such as good drains, SUDS, mulch on planted areas and resilient plant species.)",
          },
        ],
      },

      {
        title: { tag: "h2", content: "Food" },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "growingfood",
            text: "There are good facilities for growing food in the grounds.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "fruittrees",
            text: "There is a good range of fruit trees or bushes.",
          },
        ],
      },
    ],
  },
  {
    number: 6,
    title: "Community and Participation",
    id: "community",
    subsections: [
      {
        title: { tag: "h2", content: "Design and Creation" },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "pupilsdesign",
            text: "Pupils are actively involved in designing and creating playground improvements.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "parentsdesign",
            text: "Parents and other community members are actively involved in designing and creating playground improvements.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "staffdesign",
            text: "Staff members, both teaching and non-teaching, are actively involved in designing and creating playground improvements.",
          },
          {
            type: TEXT_WITH_YEAR,
            id: "datedImprovements",
            text: "What and when were the 3 most recent playground improvements that pupils have been involved in?",
          },
        ],
      },

      {
        title: [
          { tag: "h2", content: "Management" },
          {
            tag: "p",
            content: [
              "Pupils are actively involved in ",
              { tag: "b", content: "managing" },
              " the following aspects of the grounds:",
            ],
          },
        ],

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "managegrowing",
            text: "Growing and tending.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "managelitter",
            text: "Litter picking.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "manageother",
            text: "Other.",
          },
        ],
      },

      {
        title: { tag: "h2", content: "Community Use and Access" },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "childrenoutside",
            text: "Children are welcome to play in the school grounds outside of school time.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "adultsoutside",
            text: "Adults are welcome to walk or play in the school grounds outside of school time.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "communityoutside",
            text: "Other community organisations [guides, youth clubs etc.] make good use of our grounds outside of school time.",
            weight: 0.5,
          },
          {
            type: TEXT_AREA,
            id: "othercommunity",
            text: "Any other thoughts or comments about about community and participation in your grounds?",
          },
        ],
      },
    ],
  },
  {
    number: 7,
    title: "Local Greenspace",
    id: "greenspace",
    subsections: [
      {
        questions: [
          {
            type: TEXT_AREA,
            id: "namegreenspace",
            text: "What area of nearby local greenspace has the most potential for regular school use for outdoor learning and play?",
          },
        ],
      },

      {
        title: {
          tag: "p",
          content: {
            tag: "b",
            content:
              "It will be helpful if you can visit this area with some of your pupils to help you fill in the rest of this section. You might also get some useful ideas or thoughts from parents with relevant expertise or from your local countryside ranger.",
          },
        },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "accessible",
            text: "This area is readily accessible for regular use by the school.",
          },
          {
            type: TEXT_AREA,
            id: "improveaccessible",
            text: "How might you be able to improve its accessibility - for example with a gate, clearing a path, bridging a ditch etc.?",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "frequentuse",
            text: "The school uses this space a lot (e.g. at least monthly).",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "wildlife",
            text: "The area is really valuable for wildlife.",
          },
          {
            type: TEXT_AREA,
            id: "improvewildlife",
            text: "How might you improve the area for wildlife?",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "teaching",
            text: "As it is, the area is a really useful space for teaching and play.",
          },
          {
            type: TEXT_AREA,
            id: "improveteaching",
            text: "How could it be made more useful for teaching and play?",
          },
          {
            type: TEXT_AREA,
            id: "listowner",
            text: "Who owns this area of land?",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "changes",
            text: "Will it be straightforward to agree any changes you'd like to make with the land owner?",
          },
        ],
      },
    ],
  },
  {
    number: 8,
    title: "Your Practice",
    id: "practice",
    subsections: [
      {
        title: { tag: "h2", content: "Learning" },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "developingcurriculum",
            text: "The school improvement plan includes developing  curriculum learning and / or play outdoors.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "curriculumtopic",
            text: "On average, most teachers will teach a curriculum topic outdoors at least once a month.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "resources",
            text: "We have pre-prepared resources that we can take outdoors to support a wide range of curriculum learning.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "outcomes",
            text: "Outdoor lessons have clearly specified curriculum outcomes that we are able to assess.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "principles",
            text: "Our outdoor learning programme is planned with reference to principles for curriculum design.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "growfood",
            text: "We grow food in school.",
          },
        ],
      },

      {
        title: { tag: "h2", content: "Play" },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "playpolicy",
            text: "Our school has a play policy.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "playrain",
            text: "Pupils are allowed to play outside in light rain if they wish.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "playsnow",
            text: "Pupils are allowed to play outside in snowy or icy weather if they wish.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "allages",
            text: "Children of all ages can mix and play together in some areas if they wish.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "outofsight",
            text: "Children are allowed to play out of sight of supervisors - for example behind trees or in bushes.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "typesofplay",
            text: "The playground is zoned to cater for different types of play: active, quiet, creative etc.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "monitoring",
            text: "Pupils are involved in agreeing and monitoring playground rules and behaviour.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "skillstraining",
            text: "Playground supervisors have had basic play skills training.",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "oldersupervising",
            text: "Older children play an active role in supporting and supervising play.",
          },
        ],
      },
    ],
  },
  {
    number: 9,
    title: "Your Reflection and Feedback",
    id: "reflection",
    subsections: [
      {
        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "groundsadvisor",
            text: "If there was a school grounds advisor available in this area then would you make use of them in your school?",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "onlineresources",
            text: "Would it be helpful to have online information and resources on how to develop some of the ideas suggested in this audit?",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "CPD",
            text: "CPD on how to develop some of the ideas suggested in this audit would be really useful.",
          },
        ],
      },

      {
        title: { tag: "h2", content: "About this survey" },

        questions: [
          {
            type: SCALE_WITH_COMMENT,
            id: "straightforward",
            text: "Would you say it was fairly straightforward to answer the questions in this audit?",
          },
          {
            type: SCALE_WITH_COMMENT,
            id: "ideas",
            text: "Would you say that the process of completing this audit has given you some ideas for how to improve your outdoor learning and play provision?",
          },
        ],
      },
    ],
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

export function sectionQuestions(section) {
  return section.subsections.reduce((questions, subsection) => {
    questions.push(...subsection.questions);
    return questions;
  }, []);
}
