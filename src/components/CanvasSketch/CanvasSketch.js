import React, { useRef, useEffect } from 'react';

import BrushIcon from '@material-ui/icons/Brush';

import './CanvasSketch.css';

const width = 128;
const height = 128;

let lineColor = 'black';
let lineWidth = 2;
let prevX = 0, prevY = 0, currX = 0, currY = 0;
let drawing = false;

let canvas;
let ctx;

function CanvasSketch() {

  const canvasRef = useRef();

  function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();
  }

  function findxy(res, e) {

    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;

    if (res === 'down') drawing = true;
    else if (res === 'move' && drawing) draw();
  }

  // get canvas and context on start
  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas?.getContext('2d');
  }, [])

  return (
    <div className="CanvasSketch">
      <h1><BrushIcon /> Sketch</h1>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={e => findxy('move', e)}
        onMouseDown={e => findxy('down', e)}
        onMouseUp={e => {drawing = false;}}
        onMouseLeave={e => {drawing = false;}}
      />
    </div>
  );
}

export default CanvasSketch;
