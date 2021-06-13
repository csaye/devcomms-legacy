import React, { useRef, useEffect, useState } from 'react';

import BrushIcon from '@material-ui/icons/Brush';
import UndoIcon from '@material-ui/icons/Undo';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';

import { useDocument } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './Sketch.css';

// width and height of canvas in pixels
const width = 512;
const height = 512;

let prevX = 0, prevY = 0, currX = 0, currY = 0;
let drawing = false;

let canvas;
let ctx;

const lineColors = ['red', 'orange', 'yellow', 'green', 'blue', 'black'];

function Sketch(props) {
  const [lastCanvasUrl, setLastCanvasUrl] = useState(undefined);
  const [lineWidth, setLineWidth] = useState(2);
  const [lineColor, setLineColor] = useState('black');
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef();
  const sketchRef = useRef();

  // get sketch data reference
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const channelDoc = groupDoc.collection('channels').doc(props.channel);
  const [sketchData] = useDocument(channelDoc);

  // updates sketch in firebase
  async function updateSketch() {

    // get canvas url
    const url = canvas.toDataURL();

    // update firebase document
    await channelDoc.update({
      data: url
    });
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
    currX = e.clientX - canvas.offsetLeft + window.scrollX + sketchRef.current.scrollLeft;
    currY = e.clientY - canvas.offsetTop + window.scrollY + sketchRef.current.scrollTop;

    // if moving mouse, draw
    if (operation === 'move') draw();
  }

  // clears canvas
  function clearCanvas() {
    // confirm delete
    if (!window.confirm('Clear canvas?')) return;
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
    if (!url) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = url;
  }

  async function undoCanvas() {
    // load url to canvas
    if (!lastCanvasUrl) return;
    loadUrl(lastCanvasUrl);

    // update firebase document
    await channelDoc.update({
      data: lastCanvasUrl
    });

    // clear last canvas url
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
    if (!sketchData) return;
    // load data
    const docData = sketchData.data();
    if (!docData) return;
    const url = docData.data;
    loadUrl(url);
    setLoaded(true);
  }

  // get canvas and context on start
  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d');
  }, []);

  // get data when sketch data changes
  useEffect(() => {
    getData();
  }, [sketchData]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Sketch" ref={sketchRef}>
      {loaded && <h1><BrushIcon /> Sketch</h1>}
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
            <div className="indicator-container">
              <div
                className={
                  lineColor === "white" ?
                  "line-indicator white-selected" :
                  "line-indicator"
                }
                style={{"height": `${lineWidth * 2}px`, "width": `${lineWidth * 2}px`, "background": `${lineColor}`}}
              />
            </div>
            <input
              className="width-slider"
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
              <button className="canvas-button clean-btn var3" onClick={undoCanvas}><UndoIcon /></button> :
              <button className="canvas-button disabled clean-btn var3" disabled><UndoIcon /></button>
            }
            <button className="canvas-button clean-btn var3" onClick={clearCanvas}><DeleteIcon /></button>
            <button className="canvas-button clean-btn var3" onClick={downloadCanvas}><GetAppIcon /></button>
          </div>
        </> :
        <p>Loading...</p>
      }
    </div>
  );
}

export default Sketch;
