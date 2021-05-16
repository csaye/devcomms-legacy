import Pixel from '../Pixel/Pixel.js';

import BrushIcon from '@material-ui/icons/Brush';

import './Sketch.css';

function Sketch() {
  const pixels = [];
  for (let i = 0; i < 100; i++) pixels.push(i);

  return (
    <div className="Sketch">
      <h1><BrushIcon /> Sketch</h1>
      <div className="sketch-board">
        {
          pixels.map(i =>
            <Pixel key={`pixel-${i}`} />
          )
        }
      </div>
    </div>
  );
}

export default Sketch;
