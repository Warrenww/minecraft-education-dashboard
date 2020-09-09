import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const sleep = (ms) => new Promise(function(resolve, reject) {
  setTimeout(resolve, ms);
});

const resetAgentPosition = () => {
  return new Promise(async function(resolve, reject) {
    await fetch('http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=tp @c 0 0 0 facing 0 0 1');
    await fetch('http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=tp @c @s');
    resolve()
  });
}

const scan = async (args, callback) => {
  await resetAgentPosition();
  const blocks = [];
  const n = args.Size;
  let flag_x = 1;
  let flag_z = 1;

  for(let y = 0 ; y < n; y ++){
    for(let z = 0 ; z < n; z ++){
      z && await fetch(`http://localhost:8080/move?direction=${flag_z?'forward' : 'back'}`);
      for(let x = 0 ; x < n; x ++){
        x && await fetch(`http://localhost:8080/move?direction=${flag_x?'left':'right'}`);
        let block = await fetch("http://localhost:8080/inspect?direction=down").then(res => res.json()).then(result => result);
        callback(
          <Box position="relative" display="inline-flex">
            <CircularProgress variant="static" value={(y * n * n + z * n + x) / n**3 * 100}/>
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
              {`${Math.round( (y * n * n + z * n + x) / n**3 * 100 )}%`}
            </Box>
          </Box>
        );
        if(block.blockName === 'air') continue;
        await fetch(`http://localhost:8080/collect?item=all`);
        await fetch(`http://localhost:8080/destroy?direction=down`);
        blocks.push({
          x: flag_x ? x : n - x - 1,
          y: n - y - 1,
          z: flag_z ? z : n - z - 1,
          block: block.blockName
        });
      }
      flag_x ^= 1;
    }
    await fetch("http://localhost:8080/move?direction=down");
    flag_z ^= 1;
  }
  // console.table(blocks);
  const downloadURL = await URL.createObjectURL(new Blob([JSON.stringify(blocks)], {type : 'application/json'}));
  callback(
    <Button variant="contained">
      <a href={downloadURL} download>download</a>
    </Button>
  );
}

const readFile = (file) => {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      resolve(evt.target.result);
    };
    reader.readAsText(file);
  });
}

const build = async (args, callback) => {
  await resetAgentPosition();
  const recipe = JSON.parse(await readFile(args.File).then(res => res));
  recipe.map(async (item, index) => {
    await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ setblock ~${item.x}~${item.y}~${item.z} ${item.block}`);
    callback(
      <Box position="relative" display="inline-flex">
        <CircularProgress variant="static" value={index / recipe.length * 100}/>
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
          {`${Math.round( index / recipe.length * 100 )}%`}
        </Box>
      </Box>
    )
  });
  callback(<div>Done</div>)
}

const agentInspectBlock = (args, callback) => {
  fetch("http://localhost:8080/inspect?direction="+args.Direction)
     .then(res => res.json())
     .then(
       (result) => {
         // console.log(result)
         callback(<div>{JSON.stringify(result.blockName)}</div>);
       },
       (error) => {
         // console.log(error)
         callback(<div>{JSON.stringify(error)}</div>);
       }
     )
}
const agentInspectData = (args, callback) => {
  fetch("http://localhost:8080/inspectdata?direction="+args.Direction)
     .then(res => res.json())
     .then(
       (result) => {
         // console.log(result)
         callback(JSON.stringify(result.data));
       },
       (error) => {
         // console.log(error)
         callback(JSON.stringify(error));
       }
     )
}


export {
  agentInspectBlock,
  agentInspectData,
  scan,
  build,
};
