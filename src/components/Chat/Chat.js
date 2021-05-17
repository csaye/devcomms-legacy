import React, { useEffect, useRef, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import Popup from 'reactjs-popup';
import EditIcon from '@material-ui/icons/Edit';
import SendIcon from '@material-ui/icons/Send';
import ChatIcon from '@material-ui/icons/Chat';
import PublishIcon from '@material-ui/icons/Publish';

import firebase from 'firebase/app';

import './Chat.css';

const timestampOffset = 120; // delay in seconds before a new header
const maxMessages = 64; // maximum messages shown at one time

const now = new Date();
const nowDay = now.getDate();
const nowMonth = now.getMonth();
const nowYear = now.getFullYear();
const today = new Date(nowYear, nowMonth, nowDay).setHours(0, 0, 0, 0);
const yesterday = new Date(nowYear, nowMonth, nowDay - 1).setHours(0, 0, 0, 0);

let pageHidden = false; // whether page is hidden

function Chat() {
  const chatsRef = firebase.firestore().collection('chats');
  const uid = firebase.auth().currentUser.uid;

  const [text, setText] = useState('');
  const [file, setFile] = useState(undefined);
  const [newText, setNewText] = useState('');
  const [hovering, setHovering] = useState(undefined);
  const [deleting, setDeleting] = useState(false);

  // get messages
  const messagesQuery = chatsRef.orderBy('timestamp').limitToLast(maxMessages);
  const [messages] = useCollectionData(messagesQuery, { idField: 'id' });

  const messagesEnd = useRef();

  // sends current message to firebase
  async function addMessage(e) {
    e.preventDefault();
    const messageText = text;
    setText('');

    // add text message in firebase
    await chatsRef.add({
      text: messageText,
      edited: false,
      type: 'text',
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

  // uploads file as message
  async function uploadFile() {

    // if no file, return
    if (!file) return;

    // get whether file is image
    const isImage = file.type.startsWith('image/');

    // put file in storage
    await firebase.storage().ref('chat-files/' + file.name).put(file).then(snapshot => {

      // get file url
      snapshot.ref.getDownloadURL().then(url => {

        // add image message
        chatsRef.add({
          url: url,
          type: isImage ? 'image' : 'file',
          filename: file.name,
          timestamp: new Date(),
          senderName: firebase.auth().currentUser.displayName,
          senderUid: uid
        });
      });
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
    else return dateTime.toLocaleDateString();
  }

  // when messages update
  useEffect(() => {
    // scroll to end of messages
    messagesEnd.current.scrollIntoView();
    // if hidden, set title
    if (pageHidden) document.title = 'DevComms (new)'
  }, [messages]);

  // create visibility listener on start
  useEffect(() => {
    document.addEventListener("visibilitychange", () => {
      pageHidden = document.hidden;
      // if page not hidden, reset title
      if (!pageHidden) document.title = 'DevComms';
    });
  }, []);

  return (
    <div className="Chat">
      <div className="chat-header">
        <h1><ChatIcon /> Chat</h1>
      </div>
      <span className="flex-grow" />
      <div className="message-list">
        {
          messages ?
          <>
            {
              messages.length > 0 ?
              messages.map((m, i) =>
                <div key={`message-${i}`} className="message">
                  {
                    (
                      i === 0 || // first message
                      m.senderUid !== messages[i - 1].senderUid || // different sender
                      m.timestamp - messages[i - 1].timestamp > timestampOffset // time since last sender
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
                    {
                      m.type === 'text' ?
                      <>
                        {m.text}
                        {
                          m.edited &&
                          <span className="edited-text">(edited)</span>
                        }
                      </> :
                      <a href={m.url} target="_blank" rel="noreferrer">
                        {
                          m.type === 'image' ?
                          <img
                            src={m.url}
                            className="message-image"
                            alt=""
                          /> :
                          <>{m.filename}</>
                        }
                      </a>
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
                          if (m.type === 'text') setNewText(m.text);
                          setHovering(undefined);
                        }}
                      >
                        {
                          close => (
                            <div className="modal">
                              <button className="close" onClick={close}>&times;</button>
                              <div className="header">Editing Message</div>
                              <div className="content">
                                {
                                  m.type === 'text' ?
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
                                  </form> :
                                  <a href={m.url} target="_blank" rel="noreferrer">
                                    {m.filename}
                                  </a>
                                }
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
        <span ref={messagesEnd} />
      </div>
      <form onSubmit={addMessage}>
        <label htmlFor="chat-fileinput" className="upload-button">
          <PublishIcon />
        </label>
        <input
          type="file"
          id="chat-fileinput"
          onChange={e => setFile(e.target.files[0])}
          className="file-input"
        />
        <input
          value={text}
          className="text-input"
          onChange={e => setText(e.target.value)}
          placeholder="message"
          required
        />
        <button type="submit">
          <SendIcon />
        </button>
      </form>
      <Popup
        open={file !== undefined}
        onClose={() => setFile(undefined)}
        modal
      >
        {
          close => (
            <div className="modal">
              <button className="close" onClick={close}>&times;</button>
              <div className="header">Uploading File</div>
              <div className="content">
                <p>{file ? file.name : 'Loading...'}</p>
              </div>
              <button onClick={() => {
                uploadFile();
                close();
              }}>
                <SendIcon />
              </button>
            </div>
          )
        }
      </Popup>
    </div>
  );
}

export default Chat;
