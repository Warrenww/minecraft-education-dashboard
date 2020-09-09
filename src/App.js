import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import InputBase from '@material-ui/core/InputBase';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {
  agentInspectBlock,
  agentInspectData,
  scan,
  build,
} from './API';

const DirectionSelect = (value, setValue) => (
  <FormControl style={{flex: 1, margin: '0 10px'}}>
    <InputLabel>Direction</InputLabel>
    <Select
      value={value}
      onChange={e => setValue(e.target.value)}
    >
      <MenuItem value='forward'>forward</MenuItem>
      <MenuItem value='left'>left</MenuItem>
      <MenuItem value='right'>right</MenuItem>
      <MenuItem value='back'>back</MenuItem>
      <MenuItem value='up'>up</MenuItem>
      <MenuItem value='down'>down</MenuItem>
    </Select>
  </FormControl>
);

const FileChooser = (value, setValue) => (
  <FormControl style={{flex: 1, margin: '0 10px'}}>
    <InputBase
      defaultValue=""
      onChange={e => setValue(e.target.files[0])}
      inputProps={{
        accept: '.json',
        type:'file',
      }}
    />
  </FormControl>
)

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
  const [inputValue, setInputValue] = useState(props.defaultValue || "");

  const resultCallback = (res) => {
    setResult(res);
    setShowResult(true);
  }

  return (
    <Card>
      <CardContent>
        <h3>{props.title}</h3>
        <div>{props.description}</div>
      </CardContent>
      <CardActions>
        {props.inputArea(inputValue, setInputValue)}
        <Button variant="contained" onClick={_ => props.action({[props.label]: inputValue}, resultCallback)}>Execute</Button>
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
          defaultValue='forward'
          label='Direction'
          inputArea={DirectionSelect}
        />
        <CommandBlock
          title="Agen Inspet Data"
          description="Ask agent inspect [direction], return block data"
          action={agentInspectData}
          defaultValue='forward'
          label='Direction'
          inputArea={DirectionSelect}
        />
        <CommandBlock
          title="Scan"
          description="Scan the structure from your position with [size]"
          action={scan}
          defaultValue='10'
          label='Size'
          inputArea={
            (v, sv) => (
            <TextField
              label="Size"
              value={v}
              onChange={e => sv(e.target.value)}
              type='number'
              variant="outlined"
              size="small"
            />
          )}
        />
        <CommandBlock
          title="Build"
          description="Build the structure from your position with recipe [file]"
          action={build}
          defaultValue=''
          label='File'
          inputArea={FileChooser}
        />
      </Content>
    </div>
  );
}

export default App;
