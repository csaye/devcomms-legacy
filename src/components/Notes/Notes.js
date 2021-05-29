import React, { useEffect, useState } from 'react';

import DescriptionIcon from '@material-ui/icons/Description';

import { useDocument } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './Notes.css';

function Notes(props) {
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);

  // get notes reference
  const groupRef = firebase.firestore().collection('groups').doc(props.group);
  const noteRef = groupRef.collection('notes').doc('note');
  const [noteDoc] = useDocument(noteRef);

  // gets text from note data
  async function getText() {
    if (!noteDoc) return;
    // if note exists, get text
    if (noteDoc.exists) {
      const docData = noteDoc.data();
      setText(docData.text);
    // if note does not exist, create doc
    } else {
      await noteRef.set({
        text: ''
      });
    }
    setLoaded(true);
  }

  // updates firebase document text
  async function updateText(newText) {
    setText(newText);
    await noteRef.update({
      text: newText
    });
  }

  // get text when note doc changes
  useEffect(() => {
    getText();
  }, [noteDoc]); // eslint-disable-line react-hooks/exhaustive-deps

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
