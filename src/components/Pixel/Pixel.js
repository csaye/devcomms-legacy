import React, { useEffect, useState } from 'react';

import firebase from 'firebase/app';

import './Pixel.css';

function Pixel(props) {
  const id = props.id;
  const size = props.pixelSize;

  const [filled, setFilled] = useState(props.filled);

  const sketchRef = firebase.firestore().collection('sketches').doc('sketch');

  // updates pixel in firebase
  async function updatePixel(isFilled) {

    // get initial pixel list
    sketchRef.get().then(doc => {
      const docData = doc.data();
      let pixelList = docData.pixels;

      // update pixel list
      pixelList = pixelList.substring(0, id) + (isFilled ? '1' : '0') + pixelList.substring(id + 1);

      // update document in firebase
      sketchRef.update({
        pixels: pixelList
      })
    });
  }

  // update filled when props update
  useEffect(() => {
    setFilled(props.filled);
  }, [props.filled]);

  // updates pixel fill
  function fillPixel(isFilled) {
    setFilled(isFilled);
    updatePixel(isFilled);
  }

  return (
    <>
      {
        filled ?
        <div
          className="Pixel filled"
          onMouseEnter={() => {
            if (props.mouseDown) fillPixel(false);
          }}
          style={{"width": `${size}px`, "height": `${size}px`}}
        /> :
        <div
          className="Pixel"
          onMouseEnter={() => {
            if (props.mouseDown) fillPixel(true);
          }}
          style={{"width": `${size}px`, "height": `${size}px`}}
        />
      }
    </>
  );
}

export default Pixel;
