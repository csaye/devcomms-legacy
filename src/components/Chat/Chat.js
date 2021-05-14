import React, { useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import Message from '../Message/Message.js';

import firebase from 'firebase/app';

import './Chat.css';

function Chat() {
  const chatsRef = firebase.firestore().collection('chats')

  const [text, setText] = useState('');
  const [messages] = useCollectionData(chatsRef.orderBy('timestamp'));

  function sendMessage(e) {
    e.preventDefault();
    const messageText = text;
    setText('');
    firebase.firestore().collection('chats').add({
      text: messageText,
      timestamp: new Date()
    });
  }

  return (
    <div className="Chat">
      <div className="message-list">
        {
          messages &&
          messages.map((m, i) => <Message key={`message-${i}`} data={m} />)
        }
      </div>
      <form onSubmit={sendMessage}>
        <input value={text} onChange={e => setText(e.target.value)} required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
