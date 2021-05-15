import React, { useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import Popup from 'reactjs-popup';
import EditIcon from '@material-ui/icons/Edit';
import SendIcon from '@material-ui/icons/Send';

import firebase from 'firebase/app';

import 'reactjs-popup/dist/index.css';
import './Chat.css';

// delay in seconds before a new
const timestampOffset = 120;

const now = new Date();
const nowDay = now.getDate();
const nowMonth = now.getMonth();
const nowYear = now.getFullYear();
const today = new Date(nowYear, nowMonth, nowDay).setHours(0, 0, 0, 0);
const yesterday = new Date(nowYear, nowMonth, nowDay - 1).setHours(0, 0, 0, 0);

function Chat() {
  const chatsRef = firebase.firestore().collection('chats');
  const uid = firebase.auth().currentUser.uid;

  const [text, setText] = useState('');
  const [messages] = useCollectionData(
    firebase.firestore().collection('chats').orderBy('timestamp'),
  { idField: 'id' });

  // sends current message to firebase
  function addMessage(e) {
    e.preventDefault();
    const messageText = text;
    setText('');

    // add message in firebase
    chatsRef.add({
      text: messageText,
      timestamp: new Date(),
      senderName: firebase.auth().currentUser.displayName,
      senderUid: uid
    });
  }

  function deleteMessage(id) {
    chatsRef.doc(id).delete();
  }

  // returns a datetime string for given datetime
  function getDateTimeString(dateTime) {

    // separate time and date
    const time = dateTime.toLocaleTimeString([], { timeStyle: 'short' });
    const date = dateTime.setHours(0, 0, 0, 0);

    // today
    if (date === today) return `${time} today`;
    // yesterday
    else if (date === yesterday) return `${time} yesterday`;
    // past
    else return date.toLocaleDateString();
  }

  return (
    <div className="Chat">
      <div className="message-list">
        {
          messages ?
          messages.map((m, i) =>
            <div key={`message-${i}`} className="message">
              {
                (i === 0 || m.timestamp - messages[i - 1].timestamp > timestampOffset) &&
                <p className="message-header">
                  <span className="sender-name">{m.senderName}</span>
                  <span className="timestamp">{getDateTimeString(m.timestamp.toDate())}</span>
                </p>
              }
              <p className="message-text">
                {m.text}
                <Popup
                  trigger={
                    <button className="edit-button">
                      <EditIcon className="edit-icon" />
                    </button>
                  }
                  modal
                >
                  {
                    close => (
                      <div className="modal">
                        <button className="close" onClick={close}>&times;</button>
                        <div className="header">Editing Message</div>
                        <div className="content">{m.text}</div>
                        <div className="actions">
                          <button className="button" onClick={() => {
                            deleteMessage(m.id);
                            close();
                          }}>
                            delete
                          </button>
                        </div>
                      </div>
                    )
                  }
                </Popup>
              </p>
            </div>
          ) :
          <p className="message-text">Loading messages...</p>
        }
      </div>
      <form onSubmit={addMessage}>
        <input value={text} onChange={e => setText(e.target.value)} required />
        <button type="submit">
          <SendIcon />
        </button>
      </form>
    </div>
  );
}

export default Chat;
