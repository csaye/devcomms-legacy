import React, { useEffect, useState } from 'react';

import DescriptionIcon from '@material-ui/icons/Description';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './Notes.css';

function Notes() {
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);

  const noteRef = firebase.firestore().collection('notes').doc('note');
  const [noteData] = useDocumentData(noteRef);

  // gets text from note data
  async function getText() {
    if (!noteData) return;
    setText(noteData.text);
    setLoaded(true);
  }

  // updates firebase document text
  async function updateText(newText) {
    await noteRef.update({
      text: newText
    });
  }

  // get text when note data changes
  useEffect(() => {
    getText();
  }, [noteData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Notes">
      <h1><DescriptionIcon /> Notes</h1>
      {
        loaded ?
        <textarea
          value={text}
          className="flex-grow"
          onChange={e => updateText(e.target.value)}
        /> :
        <p>Loading notes...</p>
      }
    </div>
  );
}

export default Notes;
