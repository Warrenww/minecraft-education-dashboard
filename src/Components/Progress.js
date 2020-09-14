import React, {useState} from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const Progress = (props) => (
  <Box position="relative" display="inline-flex">
    <CircularProgress variant="static" value={props.value}/>
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
    {`${Math.round(props.value)}%`}
    </Box>
  </Box>
);

export default Progress;
