import React, { useEffect, useState } from 'react';

import DescriptionIcon from '@material-ui/icons/Description';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './Notes.css';

function Notes(props) {
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);

  // get notes reference
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const channelDoc = groupDoc.collection('channels').doc(props.channel);
  const [noteData] = useDocumentData(channelDoc);

  // gets text from note data
  async function getText() {
    if (!noteData) return;
    // get text
    setText(noteData.text);
    setLoaded(true);
  }

  // updates firebase document text
  async function updateText(newText) {
    setText(newText);
    await channelDoc.update({
      text: newText
    });
  }

  // get text when note doc changes
  useEffect(() => {
    getText();
  }, [noteData]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded) {
    return (
      <div className="Notes">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="Notes">
      <h1><DescriptionIcon /> Notes</h1>
      <textarea
        spellCheck="false"
        value={text}
        className="flex-grow"
        onChange={e => updateText(e.target.value)}
      />
    </div>
  );
}

export default Notes;
