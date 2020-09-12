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
    await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=tp @c ~${offsetX || 0} ~${offsetY || 0} ~${offsetZ || 0} facing ~${(offsetX || 0) + (facingX || 0) * 2} ~ ~${(offsetZ || 0) + (facingZ || 0) * 2}`);
    resolve()
  });
}

const scan = async (args, callback) => {
  await resetAgentPosition({offsetX: 1, offsetY: -1, offsetZ: 1, facingZ: 1});
  const blocks = [];
  const [sizeX, sizeY, sizeZ] = [args.SizeX, args.SizeY, args.SizeZ];
  await fetch(`http://localhost:8080/tptargettopos?victim=@p&destination=~${parseInt(sizeX / 2)}~${parseInt(sizeY / 2)}~${parseInt(sizeZ / 2)}`);
  let flag_x = 1;
  let flag_z = 1;
  console.time("scan");
  for(let y = 0 ; y < sizeY; y ++){
    for(let z = 0 ; z < sizeZ; z ++){
      z && await fetch(`http://localhost:8080/move?direction=${flag_z?'forward' : 'back'}`);
      for(let x = 0 ; x < sizeX; x ++){
        x && await fetch(`http://localhost:8080/move?direction=${flag_x?'left':'right'}`);

        await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ fill ~-1~~-1 ~1~~1 air`);
        const block = await fetch("http://localhost:8080/inspect?direction=up").then(res => res.json()).then(result => result);
        callback(
          <Box position="relative" display="inline-flex">
            <CircularProgress variant="static" value={(y * sizeZ * sizeX + z * sizeX + x) / (sizeX * sizeY * sizeZ) * 100}/>
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
              {`${Math.round((y * sizeZ * sizeX + z * sizeX + x) / (sizeX * sizeY * sizeZ) * 100 )}%`}
            </Box>
          </Box>
        );
        if(block.blockName === 'air') continue;
        const data = await fetch("http://localhost:8080/inspectdata?direction=up").then(res => res.json()).then(result => result);
        await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ setblock ~~1~ air`);

        blocks.push({
          x: flag_x ? x : sizeX - x - 1,
          y: y,
          z: flag_z ? z : sizeZ - z - 1,
          block: block.blockName,
          data: data.data,
        });
      }
      flag_x ^= 1;
    }
    await fetch("http://localhost:8080/move?direction=up");

    flag_z ^= 1;
  }
  blocks.length < 50 && console.table( blocks);
  console.timeEnd("scan");
  const downloadURL = await URL.createObjectURL(new Blob([JSON.stringify(blocks)], {type : 'application/json'}));
  callback(
    <Button variant="contained">
      <a href={downloadURL} download>download</a>
    </Button>
  );
}

const build = async (args, callback) => {
  const readFile = (file) => {
    return new Promise(function(resolve, reject) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        resolve(evt.target.result);
      };
      reader.readAsText(file);
    });
  }

  const rotate = (recipe, deg = 0, x = 1, z = 1) => {
    if(deg === 90) {
      recipe.map((item) => {
        [item.x, item.z] = [-item.z, item.x];
        item.x += z;
      });
    }
    if(deg === 180) {
      recipe.map((item) => {
        [item.x, item.z] = [-item.x, -item.z];
        item.x += x;
        item.z += z;
      });
    }
    if(deg === 270) {
      recipe.map((item) => {
        [item.x, item.z] = [item.z, -item.x];
        item.z += x;
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

  await resetAgentPosition({offsetX: 1, offsetZ: 1, facingZ: 1});
  let recipe = JSON.parse(await readFile(args.File).then(res => res));

  console.time("Build");
  recipe = rotate(recipe, Number(args.Rotate),  Math.max(...recipe.map(x=>x.x)),  Math.max(...recipe.map(x=>x.z)));
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

const bounding = async (args, callback) => {
  const [sizeX, sizeY, sizeZ] = [args.SizeX, args.SizeY, args.SizeZ];
  await resetAgentPosition()

  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~ ~${parseInt(sizeX) + 1}~-1~ stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~${parseInt(sizeZ) + 1} ~${parseInt(sizeX) + 1}~-1~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~ ~~-1~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~${parseInt(sizeX) + 1}~-1~ ~${parseInt(sizeX) + 1}~-1~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);

  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~${parseInt(sizeY)}~ ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~ stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~${parseInt(sizeY)}~ ~~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~ ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);

  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~ ~~${parseInt(sizeY)}~ stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~${parseInt(sizeZ) + 1} ~~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~${parseInt(sizeX) + 1}~-1~ ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~ stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~${parseInt(sizeX) + 1}~-1~${parseInt(sizeZ) + 1} ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);

  callback(<div>Done.</div>);
}

export {
  agentInspectBlock,
  agentInspectData,
  scan,
  build,
  bounding,
};
