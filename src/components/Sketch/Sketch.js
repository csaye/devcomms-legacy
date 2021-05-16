import React, { useRef, useEffect, useState } from 'react';

import BrushIcon from '@material-ui/icons/Brush';
import UndoIcon from '@material-ui/icons/Undo';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';

import firebase from 'firebase/app';

import './Sketch.css';

const width = 256;
const height = 256;

let prevX = 0, prevY = 0, currX = 0, currY = 0;
let drawing = false;

let canvas;
let ctx;

const lineColors = ['red', 'orange', 'yellow', 'green', 'blue', 'black'];

function Sketch() {
  const [lastCanvasUrl, setLastCanvasUrl] = useState(undefined);
  const [lineWidth, setLineWidth] = useState(2);
  const [lineColor, setLineColor] = useState('black');
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef();
  const sketchRef = firebase.firestore().collection('sketches').doc('sketch');

  // updates sketch in firebase
  async function updateSketch() {

    // get canvas url
    const url = canvas.toDataURL();

    // update firebase document
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
    if (operation === 'down') {

      // get last canvas url
      const url = canvas.toDataURL();
      setLastCanvasUrl(url);
      drawing = true;
    }

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

    // get last canvas url
    const url = canvas.toDataURL();
    setLastCanvasUrl(url);

    // fill with white
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();

    // update sketch in firebase
    updateSketch();
  }

  // loads given url onto canvas
  function loadUrl(url) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = url;
  }

  function undoCanvas() {
    if (!lastCanvasUrl) return;
    loadUrl(lastCanvasUrl);
    setLastCanvasUrl(undefined);
  }

  // downloads canvas as a png
  function downloadCanvas() {

    // get object url
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);

      // download from link element
      const link = document.createElement('a');
      link.download = 'sketch.png';
      link.href = url;
      link.click();
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
      loadUrl(url);
      setLoaded(true);
    });
  }

  // get canvas and context on start
  useEffect(() => {
    getData();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Sketch">
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
          <div className="sketch-settings">
            <p>Line width: {lineWidth}</p>
            <input
              value={lineWidth}
              onChange={e => setLineWidth(e.target.value)}
              min="1"
              max="10"
              step="0.1"
              type="range"
            />
          </div>
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
            {
              lastCanvasUrl ?
              <button className="canvas-button" onClick={undoCanvas}><UndoIcon /></button> :
              <button className="canvas-button" disabled><UndoIcon /></button>
            }
            <button className="canvas-button" onClick={clearCanvas}><DeleteIcon /></button>
            <button className="canvas-button" onClick={downloadCanvas}><GetAppIcon /></button>
          </div>
        </> :
        <p>Loading sketch...</p>
      }
    </div>
  );
}

export default Sketch;
