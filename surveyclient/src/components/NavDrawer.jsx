import React, { useEffect } from "react";
import { sectionsContent } from "../model/Content";
import { makeStyles } from "@material-ui/core/styles";
import NavDrawerSectionItem from "./NavDrawerSectionItem";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { useTheme } from "@material-ui/core/styles";
import {
  INTRODUCTION,
  RESULTS,
  GALLERY,
  SUBMIT,
} from "./FixedSectionTypes";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
}));

function NavDrawer({
  mobileOpen,
  handleDrawerToggle,
  currentSection,
  setCurrentSection,
}) {
  const classes = useStyles();
  const theme = useTheme();

  const [totalQuestionsMap, setTotalQuestionsMap] = React.useState(null);

  useEffect(() => {
    var result = new Map();
    sectionsContent.forEach((section) => {
      var questionCount = 0;
      section.content((type, id) => (questionCount += 1));
      result.set(section.id, questionCount);
    });
    setTotalQuestionsMap(result);
  }, []);

  const drawer = (
    <div className="nav-menu">
      <Divider />
      <List>{createMenuItem("Introduction", INTRODUCTION)}</List>
      <Divider />
      <List>{sectionsContent.map(createSectionMenuItem)}</List>
      <Divider />
      <List>{createMenuItem("Results", RESULTS)}</List>
      <List>{createMenuItem("Photos", GALLERY)}</List>
      <List>{createMenuItem("Submit survey", SUBMIT)}</List>
    </div>
  );

  function createMenuItem(title, id) {
    return (
      <ListItem
        button
        selected={currentSection === id}
        onClick={(event) => setCurrentSection(id)}
        key={id}
        className="nav-menu-item"
      >
        <ListItemText primary={title} />
      </ListItem>
    );
  }

  function createSectionMenuItem(section) {
    return (
      <NavDrawerSectionItem
        section={section}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        totalQuestions={
          totalQuestionsMap === null ? 0 : totalQuestionsMap.get(section.id)
        }
      />
    );
  }

  const container =
    window !== undefined ? () => window.document.body : undefined;

  return (
    <nav className={classes.drawer} aria-label="survey sections">
      <Hidden mdUp>
        <Drawer
          container={container}
          variant="temporary"
          anchor={theme.direction === "rtl" ? "right" : "left"}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          classes={{ paper: classes.drawerPaper }}
          ModalProps={{ keepMounted: true }}
        >
          <div className={classes.toolbar} />
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          classes={{ paper: classes.drawerPaper }}
          variant="permanent"
          open
        >
          <div className={classes.toolbar} />
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
}

export default NavDrawer;
