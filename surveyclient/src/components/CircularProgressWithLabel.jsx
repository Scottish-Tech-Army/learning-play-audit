import React from "react";
import "../App.css";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="static" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Tooltip title={props.tooltip} placement="top">
          <Typography variant="caption" component="div" color="textSecondary">
            {props.label}
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default CircularProgressWithLabel;
