import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';


const styles = {
  cardInput: {
    margin: '5%',
    width: '90%',
  },
}

const DirectionSelect = (value, setValue, label="Direction") => (
  <FormControl style={styles.cardInput}>
    <InputLabel>{label}</InputLabel>
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

const RotationSelect = (value, setValue, label="Rotation") => (
  <FormControl style={styles.cardInput}>
    <InputLabel>{label}</InputLabel>
    <Select
      value={value}
      onChange={e => setValue(e.target.value)}
    >
      <MenuItem value='0'>0°</MenuItem>
      <MenuItem value='90'>90°</MenuItem>
      <MenuItem value='180'>180°</MenuItem>
      <MenuItem value='270'>270°</MenuItem>
      <MenuItem value='45'>Flip Z</MenuItem>
      <MenuItem value='135'>Flip X</MenuItem>
    </Select>
  </FormControl>
);

const FileChooser = (value, setValue, label="") => (
  <FormControl style={styles.cardInput}>
    <InputBase
      defaultValue=""
      onChange={e => setValue(e.target.files[0])}
      inputProps={{
        accept: '.json',
        type:'file',
      }}
    />
  </FormControl>
);

const ImageChooser = ({value, setValue, label=""}) => (
  <FormControl style={styles.cardInput}>
    <InputBase
      defaultValue=""
      onChange={e => setValue(e.target.files[0])}
      inputProps={{
        accept: 'image/*',
        type:'file',
      }}
    />
  </FormControl>
);

const VideoChooser = ({value, setValue, label=""}) => (
  <FormControl style={styles.cardInput}>
    <InputBase
      defaultValue=""
      onChange={e => setValue(e.target.files[0])}
      inputProps={{
        accept: 'video/*',
        type:'file',
      }}
    />
  </FormControl>
);

const NumberInput = (value, setValue, label="Number") => (
  <TextField
    style={styles.cardInput}
    label={label}
    value={value}
    onChange={e => setValue(e.target.value)}
    type='number'
    variant="outlined"
    size="small"
  />
);

export {
  DirectionSelect,
  RotationSelect,
  FileChooser,
  NumberInput,
  ImageChooser,
  VideoChooser,
}
