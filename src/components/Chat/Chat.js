import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Popup from 'reactjs-popup';

import EditIcon from '@material-ui/icons/Edit';
import SendIcon from '@material-ui/icons/Send';
import PublishIcon from '@material-ui/icons/Publish';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';

import { useCollectionData } from 'react-firebase-hooks/firestore';
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
let shiftDown = false; // whether shift key is down

function Chat(props) {
  const groupRef = firebase.firestore().collection('groups').doc(props.groupId);
  const chatsRef = groupRef.collection('chats');
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
    if (e) e.preventDefault();
    const messageText = text;
    setText('');

    // add text message in firebase
    await chatsRef.add({
      text: messageText,
      edited: false,
      type: 'text',
      timestamp: new Date(),
      senderName: props.username,
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
          senderName: props.username,
          senderUid: uid
        });
      });
    });
  }

  // downloads file with given url
  async function downloadFile(fileUrl, filename) {

    // get object url
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = await URL.createObjectURL(blob);

    // download from link element
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
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

  // scroll to end of messages
  function chatScroll() {
    messagesEnd.current.scrollIntoView();
  }

  // when messages update
  useEffect(() => {
    chatScroll();
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
                      <span className="sender-name">@{m.senderName}</span>
                      <span className="timestamp">{getDateTimeString(m.timestamp.toDate())}</span>
                    </p>
                  }
                  <div
                    className="message-text"
                    onMouseEnter={() => setHovering(m.id)}
                    onMouseLeave={() => setHovering(undefined)}
                  >
                    {
                      m.type === 'text' ?
                      <>
                        <ReactMarkdown className="markdown-text">
                          {m.text}
                        </ReactMarkdown>
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
                            onLoad={chatScroll}
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
                          <button className="edit-btn">
                            <EditIcon />
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
                                  <form
                                    onSubmit={e => {
                                      updateMessage(e, m.id);
                                      close();
                                    }}
                                    style={{
                                      display: 'flex', alignItems: 'center',
                                      marginBottom: '5px'
                                    }}
                                  >
                                    <textarea
                                      autoComplete="off"
                                      spellCheck="false"
                                      value={newText}
                                      onChange={e => setNewText(e.target.value)}
                                      style={{"marginRight": "10px"}}
                                      required
                                    />
                                    <button type="submit">
                                      <CheckIcon />
                                    </button>
                                  </form> :
                                  <a href={m.url} target="_blank" rel="noreferrer">
                                    {m.filename}
                                  </a>
                                }
                              </div>
                              {
                                m.type !== 'text' &&
                                <button
                                  onClick={() => downloadFile(m.url, m.filename)}
                                >
                                  <GetAppIcon />
                                </button>
                              }
                              <hr style={{margin: '-5px 0 10px 0'}} />
                              {
                                deleting ?
                                <>
                                  <p className="delete-text">Delete message?</p>
                                  <button onClick={() => setDeleting(false)} style={{"marginRight": "5px"}}>
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
                                <button
                                  className="button"
                                  onClick={() => {
                                    setDeleting(true);
                                  }}
                                >
                                  <DeleteIcon />
                                </button>
                              }
                            </div>
                          )
                        }
                      </Popup>
                    }
                  </div>
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
        <label htmlFor="chat-fileinput" className="upload-button clean-btn">
          <PublishIcon />
        </label>
        <input
          type="file"
          id="chat-fileinput"
          onChange={e => setFile(e.target.files[0])}
          className="file-input"
        />
        <textarea
          autoComplete="off"
          spellCheck="false"
          value={text}
          className="text-input"
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.keyCode === 16) shiftDown = true;
            else if (e.keyCode === 13 && !shiftDown) {
              e.preventDefault();
              addMessage();
            }
          }}
          onKeyUp={e => {
            if (e.keyCode === 16) shiftDown = false;
          }}
          placeholder="message"
          required
        />
        <button type="submit" className="send-button clean-btn">
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
                <p>{file ? `${file.name} (${file.type})` : 'Loading...'}</p>
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
