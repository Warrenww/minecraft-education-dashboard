import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const styles = {
  executeButton: {
    alignSelf: 'center',
  },
}

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
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const resultCallback = (res) => {
    setResult(res);
    setShowResult(true);
  }
  const handleValue = (key) => {
    return (value) => setInputValue({...inputValue, [key]:value})
  }

  return (
    <Card>
      {
        props.title.length - 1 ?
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
        >
          {
            props.title.map((x,i) =>   <Tab label={x} key={i} />)
          }
        </Tabs>
        : <></>
      }
      <CardContent>
        <h3>{props.title[tabValue]}</h3>
        <div>{props.description[tabValue]}</div>
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
            _ => props.action[tabValue](inputValue, resultCallback)
          }
        >Execute</Button>
      </CardActions>
      <Collapse in={showResult}>
        {result}
      </Collapse>
    </Card>
  );
};
export default CommandBlock;
