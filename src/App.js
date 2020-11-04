import React from 'react';
import './App.css';
import styled from 'styled-components';
import CommandBlock from './Components/CommandBlock';
import DrawingBlock from './Components/DrawingBlock';
import {
  DirectionSelect,
  RotationSelect,
  FileChooser,
  NumberInput,
  BLockSelect
} from './Components/Input';
import {
  agentInspectBlock,
  agentInspectData,
  scan,
  build,
  bounding,
  removeBounding,
  island,
  moveAgent,
  resetAgentPosition,
} from './API';

import { Button, Card, Grid } from '@material-ui/core';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';
import VerticalAlignTopIcon from '@material-ui/icons/VerticalAlignTop';
import RoomIcon from '@material-ui/icons/Room';

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  background : #2c3a42;
  min-width: 100vw;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  .MuiCardActions-root {
    display: flex;
    justify-content: space-around;
    align-items: baseline;
    flex-direction: column;
  }
  .MuiCard-root {
    width: 300px;
    margin: 10px;
    .MuiCollapse-wrapperInner {
      padding: 1.5em .8em;
      width: calc(100% - 1.6em);
    }
  }
  .MuiCardContent-root {
    h3 {
      margin: 0;
      margin-bottom: 5px;
    }
  }
`;

function App() {
  return (
    <div className="App">
      <Content>
        <Card>
          <h2>Move agent</h2>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button onClick={() => moveAgent('forward')}><KeyboardArrowUpIcon /></Button>
            </Grid>
            <Grid item xs={4}>
              <Button onClick={() => moveAgent('left')}><KeyboardArrowLeftIcon /></Button>
            </Grid>
            <Grid item xs={4}>
              <Button onClick={() => resetAgentPosition()}><RoomIcon /></Button>
            </Grid>
            <Grid item xs={4}>
              <Button onClick={() => moveAgent('right')}><KeyboardArrowRightIcon /></Button>
            </Grid>
            <Grid item xs={12}>
              <Button onClick={() => moveAgent('back')}><KeyboardArrowDownIcon /></Button>
            </Grid>
            <Grid item xs={6}>
              <Button onClick={() => moveAgent('down')}><VerticalAlignBottomIcon /></Button>
            </Grid>
            <Grid item xs={6}>
              <Button onClick={() => moveAgent('up')}><VerticalAlignTopIcon /></Button>
            </Grid>
          </Grid>
        </Card>
        <CommandBlock
          title={["Agen Inspet Block", "Agen Inspet Data"]}
          description={[
            "Ask agent inspect [direction], return block name",
            "Ask agent inspect [direction], return block data"
          ]}
          action={[agentInspectBlock, agentInspectData]}
          defaultValue={['forward']}
          label={['Direction']}
          inputArea={[DirectionSelect]}
        />
        <CommandBlock
          title={["Bounding Box", "Scan", "Remove Bounding Box"]}
          description={[
            "Draw a bounding box with given [size]",
            "Scan the structure from your position with [size]",
            "Try to remove bounding box from player position with given [size]"
          ]}
          action={[bounding, scan, removeBounding]}
          defaultValue={['3', '3', '3']}
          label={['SizeX', 'SizeY', 'SizeZ']}
          inputArea={[NumberInput, NumberInput, NumberInput]}
        />
        <CommandBlock
          title={["Build"]}
          description={["Build the structure from your position with recipe [file]"]}
          action={[build]}
          defaultValue={['', 0]}
          label={['File', 'Rotate']}
          inputArea={[FileChooser, RotationSelect]}
        />
        <DrawingBlock />
        <CommandBlock
          title={["Island Generator"]}
          description={["Generate an island with given radius, deepneth, and block."]}
          action={[island]}
          defaultValue={['air', 10, 15, 0]}
          label={['block', 'radius', 'deep', 'random']}
          inputArea={[BLockSelect, NumberInput, NumberInput, NumberInput]}
        />
      </Content>
    </div>
  );
}

export default App;
