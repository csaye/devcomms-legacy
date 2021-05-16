import React, { useState } from 'react';

import './Pixel.css';

function Pixel() {
  const [filled, setFilled] = useState(false);

  return (
    <>
      {
        filled ?
        <div className="Pixel filled" onMouseDown={() => setFilled(false)} /> :
        <div className="Pixel" onMouseDown={() => setFilled(true)} />
      }
    </>
  );
}

export default Pixel;
