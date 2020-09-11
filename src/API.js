import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const sleep = (ms) => new Promise(function(resolve, reject) {
  setTimeout(resolve, ms);
});

const resetAgentPosition = (args = {}) => {
  const {offsetX, offsetY, offsetZ, facingX, facingZ} = args;
  return new Promise(async function(resolve, reject) {
    await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=tp @c 0 0 0 facing ${facingX || 0} 0 ${facingZ || 1}`);
    await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=tp @c ~${offsetX || 0} ~${offsetY || 0} ~${offsetZ || 0}`);
    resolve()
  });
}

const scan = async (args, callback) => {
  await resetAgentPosition();
  const blocks = [];
  const n = args.Size;
  let flag_x = 1;
  let flag_z = 1;
  console.time("scan");
  for(let y = 0 ; y < n; y ++){
    for(let z = 0 ; z < n; z ++){
      z && await fetch(`http://localhost:8080/move?direction=${flag_z?'forward' : 'back'}`);
      // z && await fetch(`http://localhost:8080/tptargettopos?victim=@p&destination=~ ~ ~${flag_z ? 1 : -1}`) && await fetch('http://localhost:8080/tptoplayer');
      for(let x = 0 ; x < n; x ++){
        x && await fetch(`http://localhost:8080/move?direction=${flag_x?'left':'right'}`);
        // x && await fetch(`http://localhost:8080/tptargettopos?victim=@p&destination=~${flag_x ? 1 : -1} ~ ~`) && await fetch('http://localhost:8080/tptoplayer');

        const block = await fetch("http://localhost:8080/inspect?direction=down").then(res => res.json()).then(result => result);
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
        const data = await fetch("http://localhost:8080/inspectdata?direction=down").then(res => res.json()).then(result => result);
        await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ setblock ~~-1~ air`);

        blocks.push({
          x: flag_x ? x : n - x - 1,
          y: n - y - 1,
          z: flag_z ? z : n - z - 1,
          block: block.blockName,
          data: data.data,
        });
      }
      flag_x ^= 1;
    }
    await fetch("http://localhost:8080/move?direction=down");
    // await fetch(`http://localhost:8080/tptargettopos?victim=@p&destination=~ ~-1 ~`) && await fetch('http://localhost:8080/tptoplayer');

    flag_z ^= 1;
  }
  console.table(blocks.length < 50 && blocks);
  console.timeEnd("scan");
  const downloadURL = await URL.createObjectURL(new Blob([JSON.stringify(blocks)], {type : 'application/json'}));
  callback(
    <Button variant="contained">
      <a href={downloadURL} download>download</a>
    </Button>
  );
}
const __scan = async (args, callback) => {
  await sleep(1000)
  await resetAgentPosition({offsetX: 1});
  const blocks = [];
  const n = args.Size;
  let flag_x = 1;
  let flag_z = 1;

  for(let y = 0 ; y <= n; y ++){
    for(let x = 0 ; x <= n; x ++){
      for(let z = 0 ; z <= n; z ++){
        const success = await fetch(`http://localhost:8080/move?direction=forward`).then(res => res.json()).then(result => result.success);
        if(!success) {
          const block = await fetch("http://localhost:8080/inspect?direction=forward").then(res => res.json()).then(result => result);
          const data = await fetch("http://localhost:8080/inspectdata?direction=forward").then(res => res.json()).then(result => result);
          await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ setblock ~~~1 air`);
          blocks.push({
            x: flag_x ? x : n - x - 1,
            y: n - y - 1,
            z: flag_z ? z : n - z - 1,
            block: block.blockName,
            data: data.data,
          });
          z --;
        }
      }
      await fetch("http://localhost:8080/turn?direction=right")
      await fetch("http://localhost:8080/turn?direction=right")
      await fetch(`http://localhost:8080/move?direction=${flag_z ? 'right' : 'left'}`)
      await sleep(100)
      flag_z ^= 1;
    }
    await fetch("http://localhost:8080/move?direction=up")
    await fetch(`http://localhost:8080/move?direction=${flag_x ? 'right' : 'left'}`)
    await fetch("http://localhost:8080/turn?direction=right")
    await fetch("http://localhost:8080/turn?direction=right")
    flag_x ^= 1;
  }
  console.table(blocks);
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

const rotate = (recipe, n = 1, deg = 0) => {
  if(deg === 90) {
    recipe.map((item) => {
      [item.x, item.z] = [-item.z, item.x];
      item.x += n - 1;
    });
  }
  if(deg === 180) {
    recipe.map((item) => {
      [item.x, item.z] = [-item.z, -item.x];
      item.x += n - 1;
      item.z += n - 1;
    });
  }
  if(deg === 270) {
    recipe.map((item) => {
      [item.x, item.z] = [item.z, -item.x];
      item.z += n - 1;
    });
  }

  return recipe;
}

const slowFetch = (recipe, callback) => {
  return new Promise(async function(resolve, reject) {
    for (var i = 0; i < recipe.length; i++) {
      // console.log(recipe[i]);
      await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ setblock ~${recipe[i].x}~${recipe[i].y}~${recipe[i].z} ${recipe[i].block} ${recipe[i].data || 0}`);
      callback(
        <Box position="relative" display="inline-flex">
        <CircularProgress variant="static" value={i / recipe.length * 100}/>
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
        {`${Math.round( i / recipe.length * 100 )}%`}
        </Box>
        </Box>
      );
      if(i % 100 === 0) {
        await sleep(500);
        // console.clear();
      }
    }
    resolve();
  });
}

const build = async (args, callback) => {
  await resetAgentPosition();
  let recipe = JSON.parse(await readFile(args.File).then(res => res));
  console.time("Build");
  recipe = rotate(recipe, Math.max(...recipe.map(x=>x.x)) + 1, Number(args.Rotate));
  if(recipe.length > 500) await slowFetch(recipe, callback);
  else {
    recipe.forEach(async (item, index) => {
      await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ setblock ~${item.x}~${item.y}~${item.z} ${item.block} ${item.data || 0}`);
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
      );
    });
  }
  callback('Done.');
  console.timeEnd("Build");
}

const agentInspectBlock = (args, callback) => {
  fetch("http://localhost:8080/inspect?direction="+args.Direction)
     .then(res => res.json())
     .then(
       (result) => {
         // console.log(result)
         callback(JSON.stringify(result.blockName));
       },
       (error) => {
         // console.log(error)
         callback(JSON.stringify(error));
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
