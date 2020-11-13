import React from 'react';
import Button from '@material-ui/core/Button';
import Progress from './Components/Progress'

const sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));

const resetAgentPosition = (args = {}) => {
  const {offsetX, offsetY, offsetZ, facingX, facingZ} = args;
  return new Promise(async function(resolve, reject) {
    console.log(args)
    await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=tp @c ~${offsetX || 0} ~${offsetY || 0} ~${offsetZ || 0} facing ~${(offsetX || 0) + (facingX || 0) * 2} ~ ~${(offsetZ || 0) + (facingZ || 0) * 2}`);
    resolve()
  });
}

const moveAgent = (direction = 'forward') => (new Promise(async function(resolve, reject) {
  await fetch(`http://localhost:8080/move?direction=${direction}`);
  resolve();
}));

const scan = async (args, callback) => {
  const [sizeX, sizeY, sizeZ] = [args.SizeX, args.SizeY, args.SizeZ];
  await resetAgentPosition({offsetX: 1, offsetY: sizeY, offsetZ: 1, facingZ: 1});
  const blocks = [];
  await fetch(`http://localhost:8080/tptargettopos?victim=@p&destination=~${parseInt(sizeX / 2)}~${parseInt(sizeY / 2)}~${parseInt(sizeZ / 2)}`);
  let flag_x = 1;
  let flag_z = 1;
  console.time("scan");
  for(let y = 0 ; y < sizeY; y ++){
    for(let z = 0 ; z < sizeZ; z ++){
      z && await moveAgent(flag_z ? 'forward' : 'back');
      for(let x = 0 ; x < sizeX; x ++){
        x && await moveAgent(flag_x ? 'left' : 'right');

        // await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ fill ~-1~~-1 ~1~~1 air`);
        const block = await fetch("http://localhost:8080/inspect?direction=down").then(res => res.json()).then(result => result);
        callback(<Progress value={(y * sizeZ * sizeX + z * sizeX + x) / (sizeX * sizeY * sizeZ) * 100} />);
        if(block.blockName === 'air') continue;
        const data = await fetch("http://localhost:8080/inspectdata?direction=down").then(res => res.json()).then(result => result);
        await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ setblock ~~-1~ air`);

        blocks.push({
          x: flag_x ? x : sizeX - x - 1,
          y: sizeY - y - 1,
          z: flag_z ? z : sizeZ - z - 1,
          block: block.blockName,
          data: data.data,
        });
      }
      flag_x ^= 1;
    }
    await moveAgent('down');
    flag_z ^= 1;
  }
  blocks.length < 50 && console.table(blocks);
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
    const rotate_map = [0, 2, 1, 3];
    const test_rotate = blockName => {
      if(
        blockName.includes('stairs') ||
        blockName.includes('door')
      ) return [true, 0, 1];
      if(
        blockName.includes('chest') ||
        blockName.includes('furnace') ||
        blockName.includes('smoker')
      ) return [true, 0, -1]; // [0, 3, 1, 2]
      if(
        blockName.includes('terracotta') ||
        blockName.includes('observer') ||
        blockName.includes('dispenser') ||
        blockName.includes('dropper')
      ) return [true, 2, -1]; // [2, 5, 3, 4] -> [0, 3, 1, 2]
      return [false, 0 ,0];
    }

    if(deg === 90) {
      recipe.forEach(item => {
        if(!item.block) return;
        [item.x, item.z] = [-item.z, item.x];
        item.x += z;
        const [is_need_rotate, shift, direction] = test_rotate(item.block);
        if(is_need_rotate) {
          item.data -= shift;
          if(item.data >= 0) {
            const idx = ((rotate_map.indexOf(Number(item.data).toString(2) & '3') + 1*direction) + 4) % 4;
            item.data = parseInt(item.data / 4) * 4 + rotate_map[idx];
          }
          item.data += shift;
        }
      });
    }
    if(deg === 180) {
      recipe.forEach(item => {
        if(!item.block) return;
        [item.x, item.z] = [-item.x, -item.z];
        item.x += x;
        item.z += z;
        const [is_need_rotate, shift, direction] = test_rotate(item.block);
        if(is_need_rotate) {
          item.data -= shift;
          if(item.data >= 0) {
            const idx = ((rotate_map.indexOf(Number(item.data).toString(2) & '3') + 2*direction) + 4) % 4;
            item.data = parseInt(item.data / 4) * 4 + rotate_map[idx];
          }
          item.data += shift;
        }
      });
    }
    if(deg === 270) {
      recipe.forEach(item => {
        if(!item.block) return;
        [item.x, item.z] = [item.z, -item.x];
        item.z += x;
        const [is_need_rotate, shift, direction] = test_rotate(item.block);
        if(is_need_rotate) {
          item.data -= shift;
          if(item.data >= 0) {
            const idx = ((rotate_map.indexOf(Number(item.data).toString(2) & '3') + 3*direction) + 4) % 4;
            item.data = parseInt(item.data / 4) * 4 + rotate_map[idx];
          }
          item.data += shift;
        }
      });
    }
    if(deg === 45) {
      recipe.forEach(item => {
        if(!item.block) return;
        item.z =  -item.z;
        item.z += z;
        const [is_need_rotate, shift, direction] = test_rotate(item.block);
        if(is_need_rotate) {
          item.data -= shift;
          if(item.data >= 0) {
            const idx = ((rotate_map.indexOf(Number(item.data).toString(2) & '3') + 2*direction) + 4) % 4;
            item.data = idx % 2 ? parseInt(item.data / 4) * 4 + rotate_map[idx] : item.data;
          }
          item.data += shift;
        }
      });
    }
    if(deg === 135) {
      recipe.forEach(item => {
        if(!item.block) return;
        item.x = -item.x;
        item.x += x;
        const [is_need_rotate, shift, direction] = test_rotate(item.block);
        if(is_need_rotate) {
          item.data -= shift;
          if(item.data >= 0) {
            const idx = ((rotate_map.indexOf(Number(item.data).toString(2) & '3') + 2*direction) + 4) % 4;
            item.data = idx % 2 ? item.data : parseInt(item.data / 4) * 4 + rotate_map[idx];
          }
          item.data += shift;
        }
      });
    }

    return recipe;
  }

  await resetAgentPosition({offsetX: 1, offsetZ: 1, facingZ: 1});
  let recipe = JSON.parse(await readFile(args.File).then(res => res));
  const check_await = (blockName) => {
    const check_list = [
      'redstone',
      'torch',
      'repeater',
      'pressure_plate',
      'comparator',
      'button',
      'water',
      'lava',
      'lantern',
      '_sign',
      'lever',
    ];
    for (let i of check_list) {
      if (blockName.includes(i)) return true;
    }
    return false;
  }

  console.time("Build");
  const [max_x, max_y, max_z] = [Math.max(...recipe.map(x=>x.x)), Math.max(...recipe.map(x=>x.y)), Math.max(...recipe.map(x=>x.z))];
  recipe = rotate(recipe, Number(args.Rotate),  max_x, max_z);
  const waitingQueue = [];
  for (let i = 0; i < recipe.length; i++) {
    if(!recipe[i].block) continue;
    if(check_await(recipe[i].block)) {
      waitingQueue.push(recipe[i]);
      continue;
    }
    fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ setblock ~${recipe[i].x}~${recipe[i].y}~${recipe[i].z} ${recipe[i].block} ${recipe[i].data || 0}`);
    callback( <Progress value={i / recipe.length * 100} /> );
    await sleep(10);
  }
  await sleep(100);
  for (let i = 0; i < waitingQueue.length; i++) {
    fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ setblock ~${waitingQueue[i].x}~${waitingQueue[i].y}~${waitingQueue[i].z} ${waitingQueue[i].block} ${waitingQueue[i].data || 0}`);
    await sleep(10);
  }
  callback(
    <div>
      {/*<span>{`(${max_x}, ${max_y}, ${max_z})`}</span>*/}
      <Progress value={100} />
    </div>
  );
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
  callback(<Progress value={100 / 3} />);

  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~${parseInt(sizeY)}~ ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~ stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~${parseInt(sizeY)}~ ~~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~ ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);
  callback(<Progress value={100 / 3 * 2} />);

  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~ ~~${parseInt(sizeY)}~ stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~${parseInt(sizeZ) + 1} ~~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~${parseInt(sizeX) + 1}~-1~ ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~ stained_glass 14 replace air 0`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~${parseInt(sizeX) + 1}~-1~${parseInt(sizeZ) + 1} ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} stained_glass 14 replace air 0`);

  callback(<Progress value={100} />);
}

const removeBounding = async (args, callback) => {
  const [sizeX, sizeY, sizeZ] = [args.SizeX, args.SizeY, args.SizeZ];
  await resetAgentPosition()

  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~ ~${parseInt(sizeX) + 1}~-1~ air 0 replace stained_glass 14`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~${parseInt(sizeZ) + 1} ~${parseInt(sizeX) + 1}~-1~${parseInt(sizeZ) + 1} air 0 replace stained_glass 14`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~ ~~-1~${parseInt(sizeZ) + 1} air 0 replace stained_glass 14`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~${parseInt(sizeX) + 1}~-1~ ~${parseInt(sizeX) + 1}~-1~${parseInt(sizeZ) + 1} air 0 replace stained_glass 14`);
  callback(<Progress value={100 / 3} />);

  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~${parseInt(sizeY)}~ ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~ air 0 replace stained_glass 14`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} air 0 replace stained_glass 14`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~${parseInt(sizeY)}~ ~~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} air 0 replace stained_glass 14`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~ ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} air 0 replace stained_glass 14`);
  callback(<Progress value={100 / 3 * 2} />);

  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~ ~~${parseInt(sizeY)}~ air 0 replace stained_glass 14`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~~-1~${parseInt(sizeZ) + 1} ~~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} air 0 replace stained_glass 14`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~${parseInt(sizeX) + 1}~-1~ ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~ air 0 replace stained_glass 14`);
  await fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ fill ~${parseInt(sizeX) + 1}~-1~${parseInt(sizeZ) + 1} ~${parseInt(sizeX) + 1}~${parseInt(sizeY)}~${parseInt(sizeZ) + 1} air 0 replace stained_glass 14`);

  callback(<Progress value={100} />);
}

const drawImage = async (recipe, config, setProgress) => new Promise(
  async (resolve, reject) => {
    await resetAgentPosition();
    const max_w = Math.max(...recipe.map(x => x.x));
    const max_h = Math.max(...recipe.map(x => x.y));
    switch (config.facing) {
      case 'x':
        recipe = recipe.map(tmp => ({
          ...tmp,
          x: -1,
          y: parseInt(max_h - tmp.y),
          z: parseInt(max_w - tmp.x),
        }));
        break;
      case 'y':
        recipe = recipe.map(tmp => ({
          ...tmp,
          x: parseInt(max_w - tmp.x),
          y: -1,
          z: parseInt(max_h - tmp.y),
        }));
        break;
      case 'z':
        recipe = recipe.map(tmp => ({
          ...tmp,
          x: parseInt(max_w - tmp.x),
          y: parseInt(max_h - tmp.y),
          z: -1,
        }));
        break;
      default:
        reject();
    }
    console.time('Draw');
    for(let i = 0; i < recipe.length; i++) {
      fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~~~ setblock ~${recipe[i].x}~${recipe[i].y}~${recipe[i].z} ${recipe[i].recipe}`);
      // setProgress(i / recipe.length * 100);
      await sleep(10);
    }
    console.timeEnd('Draw');
  }
);

const island = async (args, callback) => {
  const {block, radius, deep, random} = args;
  await resetAgentPosition();

  const circle = r => {
    const result = [];
    for (let x = 0; x <= r; x++) {
      for (let y = 0; y < Math.round((r*r - x*x)**0.5 + Math.random() * random); y++) {
        result.push([x,y]);
        result.push([-x,y]);
        result.push([x,-y]);
        result.push([-x,-y]);
      }
    }
    return result;
  }

  const func = x => radius / deep**2 * (x - deep)**2;

  for (let h = 0; h < deep; h ++) {
    const r = func(h);
    const recipe = circle(Math.round(r)).map(t => [t[0], -h, t[1]]);
    for (let [x,y,z] of recipe) {
      fetch(`http://localhost:8080/executeasother?origin=@p&position=~ ~ ~&command=execute @c ~ ~ ~ setblock ~${x} ~${y - 1} ~${z} ${block || 'stone'}`);
      await sleep(10);
    }
  }

}
export {
  sleep,
  agentInspectBlock,
  agentInspectData,
  scan,
  build,
  bounding,
  removeBounding,
  drawImage,
  island,
  moveAgent,
  resetAgentPosition,
};
