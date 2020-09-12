import React, {useState} from 'react';
import './App.css';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';
import {
  DirectionSelect,
  RotationSelect,
  FileChooser,
  NumberInput,
} from './Input';
import {
  agentInspectBlock,
  agentInspectData,
  scan,
  build,
  bounding,
} from './API';

const styles = {
  executeButton: {
    alignSelf: 'center',
  },

}

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

const CommandBlock = props => {
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(<></>);
  const [inputValue, setInputValue] = useState(
    props.label.map((x,i) => {
      return {
        key: x,
        value: props.defaultValue[i]
      }
    }).reduce((acc, curr, idx) => {
      return {...acc, [curr.key]: curr.value}
    }, {})
  );

  const resultCallback = (res) => {
    setResult(res);
    setShowResult(true);
  }
  const handleValue = (key) => {
    return (value) => setInputValue({...inputValue, [key]:value})
  }

  return (
    <Card>
      <CardContent>
        <h3>{props.title}</h3>
        <div>{props.description}</div>
      </CardContent>
      <CardActions>
        {
          props.inputArea.map((child, i) =>
            child(inputValue[props.label[i]], handleValue(props.label[i]), props.label[i])
          )
        }
        <Button
          variant="contained"
          style={styles.executeButton}
          onClick={
            _ => props.action(inputValue, resultCallback)
          }
        >Execute</Button>
      </CardActions>
      <Collapse in={showResult}>
        {result}
      </Collapse>
    </Card>
  );
};

function App() {
  return (
    <div className="App">
      <Content>
        <CommandBlock
          title="Agen Inspet Block"
          description="Ask agent inspect [direction], return block name"
          action={agentInspectBlock}
          defaultValue={['forward']}
          label={['Direction']}
          inputArea={[DirectionSelect]}
        />
        <CommandBlock
          title="Agen Inspet Data"
          description="Ask agent inspect [direction], return block data"
          action={agentInspectData}
          defaultValue={['forward']}
          label={['Direction']}
          inputArea={[DirectionSelect]}
        />
        <CommandBlock
          title="Bounding Box"
          description="Draw a bounding box with given [size]"
          action={bounding}
          defaultValue={['3', '3', '3']}
          label={['SizeX', 'SizeY', 'SizeZ']}
          inputArea={[NumberInput, NumberInput, NumberInput]}
        />
        <CommandBlock
          title="Scan"
          description="Scan the structure from your position with [size]"
          action={scan}
          defaultValue={['3', '3', '3']}
          label={['SizeX', 'SizeY', 'SizeZ']}
          inputArea={[NumberInput, NumberInput, NumberInput]}
        />
        <CommandBlock
          title="Build"
          description="Build the structure from your position with recipe [file]"
          action={build}
          defaultValue={['', 0]}
          label={['File', 'Rotate']}
          inputArea={[FileChooser, RotationSelect]}
        />
      </Content>
    </div>
  );
}

export default App;
