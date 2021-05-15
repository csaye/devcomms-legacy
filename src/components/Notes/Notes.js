import React, { useEffect, useState } from 'react';

import DescriptionIcon from '@material-ui/icons/Description';

import firebase from 'firebase/app';

import './Notes.css';

function Notes() {
  const [text, setText] = useState('');
  const [placeholder, setPlaceholder] = useState('Loading notes...');

  const noteRef = firebase.firestore().collection('notes').doc('note');

  // gets text from firebase document
  async function getText() {
    await noteRef.get().then(doc => {
      const docData = doc.data();
      setText(docData.text);
      setPlaceholder('');
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
      <textarea
        placeholder={placeholder}
        value={text}
        className="flex-grow"
        onChange={e => {
          const val = e.target.value;
          setText(val);
          updateText(val);
        }}
      />
    </div>
  );
}

export default Notes;
