import React, { useState, useEffect} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import TextField from '@material-ui/core/TextField';
import { ImageChooser, VideoChooser } from './Input';
import ColorSet from '../Constants/ColorSet';
import Progress from './Progress';
import { drawImage } from '../API';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const hex2rgb = (hex) => {
  let [r, g, b, a] = [0, 0, 0, 1];
  if( hex === "" ) hex = "000000";
  if( hex.charAt(0) === "#" ) hex = hex.substring(1, hex.length);
  if( hex.length !== 6 && hex.length !== 8 && hex.length !== 3 )
  {
  	console.error("Please enter 6 digits color code !");
  	return;
  }
  if( hex.length === 3 )
  {
  	r = hex.substring(0,1);
  	g = hex.substring(1,2);
  	b = hex.substring(2,3);
  	r = r + r;
  	g = g + g;
  	b = b + b;
  }
  else
  {
  	r = hex.substring(0,2);
  	g = hex.substring(2,4);
  	b = hex.substring(4,6);
  }
  if( hex.length === 8 )
  {
    a = hex.substring(6,8);
    a = (parseInt(a, 16) / 255.0).toFixed(2);
  }
  r = parseInt(r, 16);
  g = parseInt(g, 16);
  b = parseInt(b, 16);
  return [r, g, b, a];
};

const styles = {
  input: {
    marginBottom: 10,
  },
	cardInput: {
		width: '50%',
	}
};

const Canvas = ({
  width,
  height,
  image,
  setRecipe,
}) => {
  useEffect(() => {
    const canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    const Imgdata = ctx.getImageData(0, 0, width, height);
    const data = Imgdata.data;
    const recipe = [];
    for (let i = 0; i < data.length; i += 4) {
      let [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      let diff = 1e20;
      let result = [r, g, b];
      recipe[i / 4] = {
        x: (i / 4) % width,
        y: parseInt((i / 4) / width),
      }
      ColorSet.forEach(x => {
        const [R, G, B] = hex2rgb(x[0]);
        const rr = (r + R) / 2;
        const d = ((2 + rr / 256) * (R - r) ** 2 + 4 * (G - g) ** 2 + (2 + (255 - rr) / 256) * (B - b) ** 2) ** 0.5;

        if( d < diff ) {
          diff = d;
          result = [R, G, B];
          if(data[i + 3]) recipe[i / 4].recipe = x[1] + ' ' + x[2];
        }
      });
      [data[i], data[i + 1], data[i + 2]] = result;
    }
    ctx.putImageData(Imgdata, 0, 0);
    setRecipe(recipe);
  }, []);
  return (
    <canvas id='canvas'></canvas>
  );
};

const VideoCanvas = ({config}) => {
	useEffect(() => {
		const video = document.getElementById('video');
		const canvas = document.getElementById('canvas');
		console.log(video)
	},[])

	return (
		<>
		 	<video id='video' src={config.url} style={{width: config.width * config.ratio}} alt=''/>
			<canvas id='canvas'></canvas>
		</>
	);
}

const DrawingBlock = (props) => {
  const [img, setImg] = useState(null);
  const [video, setVideo] = useState(null);
	const [isVideo, setTabValue] = useState(0);
  const [imgConfig, setImgConfig] = useState({
    width: 0,
    height: 0,
    url:'',
    image: null,
		video: null,
    ratio: 1,
		facing: 'y',
		pick: 5,
		start: 0,
		end: 0,
  });
  const [recipe, setRecipe] = useState([]);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const handleNext = _ => setActiveStep((prevActiveStep) => prevActiveStep + 1);
  const handleBack = _ => setActiveStep((prevActiveStep) => prevActiveStep - 1);
  const handleReset = _ => setActiveStep(0);
  const handleImgChange = file => {
    setImg(file);
    let image = new Image();
    let objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      setImgConfig({...imgConfig,
        width: image.width,
        height: image.height,
        url:objectUrl,
        image: image,
      });
    };
    image.src = objectUrl;
  }
	const handleVideoChange = file => {
		setVideo(file);
		let objectUrl = URL.createObjectURL(file);
		setImgConfig({...imgConfig,
			url:objectUrl,
		});
	}
	useEffect(() => {
		let video = document.getElementById('video');
		if (video) {
			video.oncanplay  = () => {
				setImgConfig({...imgConfig,
					width: video.videoWidth,
					height: video.videoHeight,
					end: parseInt(video.duration),
				});
			}
		}
	},[video]);

  const steps = [
    `Choose ${isVideo ? 'Video' : 'Image'}`,
    'Config properties',
    `Generating ${isVideo ? 'Video' : 'Image'}`
  ];
  const getContent = step => {
    switch (step) {
      case 0:
        return (
          <div>
						{
								isVideo
									? <VideoChooser value={img} setValue={handleVideoChange} />
									: <ImageChooser value={img} setValue={handleImgChange} />
						}
						{
							isVideo
								? (video ? <video id='video' src={imgConfig.url} style={{width: '100%'}} alt='' controls/> : <></>)
								: (img ? <img src={imgConfig.url} style={{width: '100%'}} alt='' /> : <></>)
						}
            <div>{imgConfig.width} × {imgConfig.height}</div>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField
              label='Width'
              value={imgConfig.width * imgConfig.ratio}
              onChange={e => setImgConfig({...imgConfig, ratio: parseInt(e.target.value) / imgConfig.width})}
              type='number'
              variant="outlined"
              size="small"
              style={styles.input}
            />
            <TextField
              label='Height'
              value={imgConfig.height * imgConfig.ratio}
              onChange={e => setImgConfig({...imgConfig, ratio: parseInt(e.target.value) / imgConfig.height})}
              type='number'
              variant="outlined"
              size="small"
              style={styles.input}
            />
						{
							isVideo ?
								<>
									<TextField
										label='Pick rate'
										value={imgConfig.pick}
										onChange={e => setImgConfig({...imgConfig, pick: parseInt(e.target.value)})}
										type='number'
										variant="outlined"
										size="small"
										style={styles.input}
									/>
									<TextField
										label='Start time'
										value={imgConfig.start}
										onChange={e => setImgConfig({...imgConfig, start: parseInt(e.target.value)})}
										type='number'
										variant="outlined"
										size="small"
										style={styles.input}
									/>
									<TextField
										label='End time'
										value={imgConfig.end}
										onChange={e => setImgConfig({...imgConfig, end: parseInt(e.target.value)})}
										type='number'
										variant="outlined"
										size="small"
										style={styles.input}
									/>
								</>
								: null
						}
						<FormControl style={{...styles.cardInput, ...styles.input}}>
							<InputLabel>Facing</InputLabel>
							<Select
								value={imgConfig.facing}
								onChange={e => setImgConfig({...imgConfig, facing: e.target.value})}
							>
								<MenuItem value='x'>x</MenuItem>
								<MenuItem value='y'>y</MenuItem>
								<MenuItem value='z'>z</MenuItem>
							</Select>
						</FormControl>
          </div>
        );
      case 2:
        return (
					isVideo ?
					<VideoCanvas config={imgConfig} /> :
          <Canvas
            width={imgConfig.width* imgConfig.ratio}
            height={imgConfig.height* imgConfig.ratio}
            image={imgConfig.image}
            setRecipe={setRecipe}
          />
        );
      default:
        return <div>Invalid step.</div>
    }
  }

  const buildImage = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    drawImage(recipe, imgConfig, setProgress);
  }

	const handleTabChange = (e, v) => {
		setTabValue(v);
		setImgConfig({
	    width: 0,
	    height: 0,
	    url:'',
	    image: null,
			video: null,
	    ratio: 1,
			facing: 'y',
			pick: 5,
			start: 0,
			end: 0,
	  });
		setImg(null);
		setVideo(null);
		setRecipe([]);
		setActiveStep(0);
	}

  return (
    <Card style={{width: 450}}>
			<Tabs
				value={isVideo}
				onChange={handleTabChange}
				variant="fullWidth"
			>
				<Tab label='Draw Image' key={0} />
				<Tab label='Generate Video' key={1} />
			</Tabs>
      <CardContent>
				<h3>Import {isVideo? 'Video' : 'Image'}</h3>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div>
          {activeStep === steps.length ? (
            <div>
              <div>
                <Progress value={progress} />
              </div>
              <div>
                <Button onClick={handleReset}>Reset</Button>
              </div>
            </div>
            ):(
              <div>
                {getContent(activeStep)}
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button
										variant="contained"
										color="primary"
										onClick={activeStep === steps.length - 1 ? buildImage : handleNext}
										disabled={img === null && video === null}
									>
                    {activeStep === steps.length - 1 ? 'Generate' : 'Next'}
                  </Button>
                </div>
              </div>
            )
          }
        </div>
      </CardContent>
    </Card>
  )
}

export default DrawingBlock;
