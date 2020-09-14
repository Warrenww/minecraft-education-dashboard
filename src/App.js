import React, {useState} from 'react';
import './App.css';
import styled from 'styled-components';
import CommandBlock from './Components/CommandBlock';
import {
  DirectionSelect,
  RotationSelect,
  FileChooser,
  NumberInput,
} from './Components/Input';
import {
  agentInspectBlock,
  agentInspectData,
  scan,
  build,
  bounding,
  removeBounding,
} from './API';

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
        <CommandBlock
          title={["Agen Inspet Block"]}
          description={["Ask agent inspect [direction], return block name"]}
          action={[agentInspectBlock]}
          defaultValue={['forward']}
          label={['Direction']}
          inputArea={[DirectionSelect]}
        />
        <CommandBlock
          title={["Agen Inspet Data"]}
          description={["Ask agent inspect [direction], return block data"]}
          action={[agentInspectData]}
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
      </Content>
    </div>
  );
}

export default App;
