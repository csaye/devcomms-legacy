import React, { useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import Popup from 'reactjs-popup';
import EditIcon from '@material-ui/icons/Edit';
import SendIcon from '@material-ui/icons/Send';

import firebase from 'firebase/app';

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
  const [newText, setNewText] = useState('');
  const [hovering, setHovering] = useState(undefined);
  const [deleting, setDeleting] = useState(false);

  const [messages] = useCollectionData(chatsRef.orderBy('timestamp', 'desc').limit(100), { idField: 'id' });

  // sends current message to firebase
  async function addMessage(e) {
    e.preventDefault();
    const messageText = text;
    setText('');

    // add message in firebase
    await chatsRef.add({
      edited: false,
      text: messageText,
      timestamp: new Date(),
      senderName: firebase.auth().currentUser.displayName,
      senderUid: uid
    });
  }

  // deletes a message from firebase by id
  async function deleteMessage(id) {
    await chatsRef.doc(id).delete();
  }

  // updates message of id with new text
  async function updateMessage(e, id) {
    e.preventDefault();

    // update firebase document
    await chatsRef.doc(id).update({
      edited: true,
      text: newText
    });
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

  const sortedMessages = messages ? messages.slice() : undefined;
  if (sortedMessages) sortedMessages.reverse();

  return (
    <div className="Chat">
      <div className="message-list">
        {
          sortedMessages ?
          <>
            {
              sortedMessages.length > 0 ?
              sortedMessages.map((m, i) =>
                <div key={`message-${i}`} className="message">
                  {
                    (
                      i === 0 || // first message
                      m.senderUid !== sortedMessages[i - 1].senderUid || // different sender
                      m.timestamp - sortedMessages[i - 1].timestamp > timestampOffset // time since last sender
                    ) &&
                    <p className="message-header">
                      <span className="sender-name">{m.senderName}</span>
                      <span className="timestamp">{getDateTimeString(m.timestamp.toDate())}</span>
                    </p>
                  }
                  <p
                  className="message-text"
                  onMouseEnter={() => setHovering(m.id)}
                  onMouseLeave={() => setHovering(undefined)}
                  >
                    {m.text}
                    {
                      m.edited &&
                      <span className="edited-text">(edited)</span>
                    }
                    {
                      m.senderUid === uid &&
                      <Popup
                        trigger={
                          hovering === m.id &&
                          <button className="edit-button">
                            <EditIcon className="edit-icon" />
                          </button>
                        }
                        modal
                        onOpen={() => {
                          setNewText(m.text);
                          setHovering(undefined);
                        }}
                      >
                        {
                          close => (
                            <div className="modal">
                              <button className="close" onClick={close}>&times;</button>
                              <div className="header">Editing Message</div>
                              <div className="content">
                                <form onSubmit={e => {
                                  updateMessage(e, m.id);
                                  close();
                                }}>
                                  <input
                                    value={newText}
                                    onChange={e => setNewText(e.target.value)}
                                    required
                                  />
                                  <button type="submit">update</button>
                                </form>
                              </div>
                              {
                                deleting ?
                                <>
                                  <p className="delete-text">Delete message?</p>
                                  <button onClick={() => setDeleting(false)}>
                                    cancel
                                  </button>
                                  <button onClick={() => {
                                    deleteMessage(m.id);
                                    close();
                                    setDeleting(false);
                                  }}>
                                    delete
                                  </button>
                                </> :
                                <button className="button" onClick={() => {
                                  setDeleting(true)
                                }}>
                                  delete
                                </button>
                              }
                            </div>
                          )
                        }
                      </Popup>
                    }
                  </p>
                </div>
              ) :
              <p className="info-text">No messages yet. Send one below!</p>
            }
          </> :
          <p className="info-text">Loading messages...</p>
        }
      </div>
      <form onSubmit={addMessage}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="message"
          required
        />
        <button type="submit">
          <SendIcon />
        </button>
      </form>
    </div>
  );
}

export default Chat;
