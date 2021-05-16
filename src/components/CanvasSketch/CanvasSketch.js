import React, { useRef, useEffect, useState } from 'react';

import BrushIcon from '@material-ui/icons/Brush';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import FormatColorResetIcon from '@material-ui/icons/FormatColorReset';

import firebase from 'firebase/app';

import './CanvasSketch.css';

const width = 256;
const height = 256;

let lineWidth = 2;
let prevX = 0, prevY = 0, currX = 0, currY = 0;
let drawing = false;

let canvas;
let ctx;

const lineColors = ['red', 'orange', 'yellow', 'green', 'blue', 'black'];

function CanvasSketch() {
  const [lineColor, setLineColor] = useState('black');
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef();
  const sketchRef = firebase.firestore().collection('sketches').doc('sketch');

  // updates sketch in firebase
  async function updateSketch() {
    const url = canvas.toDataURL();
    await sketchRef.update({
      data: url
    })
  }

  function draw() {

    // draw path
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();
  }

  function sketch(operation, e) {

    // if mouse down, start drawing
    if (operation === 'down') drawing = true;

    // if not drawing, return
    if (!drawing) return;

    // get previous and current mouse positions
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;

    // if moving mouse, draw
    if (operation === 'move') draw();
  }

  // clears canvas
  function clearCanvas() {

    // fill with white
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();

    // update sketch in firebase
    updateSketch();
  }

  // downloads canvas as a png
  function downloadCanvas() {
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', 'sketch.png');
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      downloadLink.setAttribute('href', url);
      downloadLink.click();
    });
  }

  // gets and sets canvas data
  async function getData() {
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d');

    // get sketch from firebase and load
    sketchRef.get().then(doc => {
      const docData = doc.data();
      const url = docData.data;
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = url;
      setLoaded(true);
    });
  }

  // get canvas and context on start
  useEffect(() => {
    getData();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="CanvasSketch">
      <h1><BrushIcon /> Sketch</h1>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={e => sketch('move', e)}
        onMouseDown={e => sketch('down', e)}
        onMouseUp={e => {drawing = false; updateSketch();}}
        onMouseLeave={e => {drawing = false; updateSketch();}}
        style={{"display": loaded ? "inline" : "none"}}
      />
      {
        loaded ?
        <>
          <div className="special-buttons">
            <button
              onClick={() => setLineColor("white")}
              style={{"background": "white"}}
              className={
                lineColor === "white" ?
                "color-button white-selected" :
                "color-button"
              }
            />
          </div>
          <div className="color-buttons">
            {
              lineColors.map((color, i) =>
                <button
                  key={`colorbutton-${i}`}
                  onClick={() => setLineColor(color)}
                  style={{"background": color}}
                  className={
                    lineColor === color ?
                    "color-button selected" :
                    "color-button"
                  }
                />
              )
            }
          </div>
          <div>
            <button className="canvas-button" onClick={clearCanvas}><DeleteIcon /></button>
            <button className="canvas-button" onClick={downloadCanvas}><GetAppIcon /></button>
          </div>
        </> :
        <p>Loading sketch...</p>
      }
    </div>
  );
}

export default CanvasSketch;
