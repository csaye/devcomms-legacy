import Pixel from '../Pixel/Pixel.js';

import BrushIcon from '@material-ui/icons/Brush';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './Sketch.css';

function Sketch() {
  const sketchQuery = firebase.firestore().collection('sketches').doc('sketch');
  const [sketchData] = useDocumentData(sketchQuery);

  const pixels = [];
  for (let i = 0; i < 100; i++) pixels.push(i);

  return (
    <div className="Sketch">
      <h1><BrushIcon /> Sketch</h1>
      {
        sketchData ?
        <div className="sketch-board">
          {
            pixels.map(i =>
              <Pixel
                key={`pixel-${i}`}
                id={i}
                filled={sketchData.pixels[i] === '1'}
              />
            )
          }
        </div> :
        <p>Loading sketch...</p>
      }
    </div>
  );
}

export default Sketch;
