import React, { useEffect, useState } from 'react';

import firebase from 'firebase/app';

import './Pixel.css';

function Pixel(props) {
  const id = props.id;

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
        <div className="Pixel filled" onMouseDown={() => fillPixel(false)} /> :
        <div className="Pixel" onMouseDown={() => fillPixel(true)} />
      }
    </>
  );
}

export default Pixel;
