import React, { useEffect, useState } from 'react';

import DescriptionIcon from '@material-ui/icons/Description';

import firebase from 'firebase/app';

import './Notes.css';

function Notes() {
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);

  const noteRef = firebase.firestore().collection('notes').doc('note');

  // gets text from firebase document
  async function getText() {
    await noteRef.get().then(doc => {
      const docData = doc.data();
      setText(docData.text);
      setLoaded(true);
    });
  }

  // updates firebase document text
  async function updateText(newText) {
    await noteRef.update({
      text: newText
    });
  }

  // get text on start
  useEffect(() => {
    getText();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Notes">
      <h1><DescriptionIcon /> Notes</h1>
      {
        loaded ?
        <textarea
          value={text}
          className="flex-grow"
          onChange={e => {
            const val = e.target.value;
            setText(val);
            updateText(val);
          }}
        /> :
        <p>Loading notes...</p>
      }
    </div>
  );
}

export default Notes;
