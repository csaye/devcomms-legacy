import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Popup from 'reactjs-popup';

import Filler from '../../../Filler/Filler.js';

import EditIcon from '@material-ui/icons/Edit';
import SendIcon from '@material-ui/icons/Send';
import PublishIcon from '@material-ui/icons/Publish';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import logo from '../../../../img/logo.png';

import './Chat.css';

const timestampOffset = 60 * 5; // delay in seconds before a new header
const messageChunk = 50; // maximum messages shown at one time

const now = new Date();
const nowDay = now.getDate();
const nowMonth = now.getMonth();
const nowYear = now.getFullYear();
const today = new Date(nowYear, nowMonth, nowDay).setHours(0, 0, 0, 0);
const yesterday = new Date(nowYear, nowMonth, nowDay - 1).setHours(0, 0, 0, 0);

let pageHidden = false; // whether page is hidden
let shiftDown = false; // whether shift key is down
let firstQuery = true; // if first query to messages
let firstScroll = true; // if page needs to be scrolled

function Chat(props) {
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const channelDoc = groupDoc.collection('channels').doc(props.channel);
  const chatsRef = channelDoc.collection('chats');
  const uid = firebase.auth().currentUser.uid;

  const [messageCount, setMessageCount] = useState(messageChunk);
  const [text, setText] = useState('');
  const [file, setFile] = useState(undefined);
  const [newText, setNewText] = useState('');
  const [hovering, setHovering] = useState(undefined);
  const [deleting, setDeleting] = useState(false);

  // get messages
  const [messagesSrc] = useCollectionData(
    chatsRef.orderBy('timestamp').limitToLast(messageCount), { idField: 'id' }
  );
  const [messages, setMessages] = useState(undefined);

  // update messages if source valid
  useEffect(() => {
    if (messagesSrc) {
      setMessages(messagesSrc);
    }
  }, [messagesSrc]);

  const messagesEnd = useRef();

  // sends current message to firebase
  async function addMessage() {
    if (!text) return;
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
    const fileRef = firebase.storage().ref(`chat-files/${file.name}`);
    const snapshot = await fileRef.put(file);

    // get file url
    const url = await snapshot.ref.getDownloadURL();

    // add image message
    await chatsRef.add({
      url: url,
      type: isImage ? 'image' : 'file',
      filename: file.name,
      timestamp: new Date(),
      senderName: props.username,
      senderUid: uid
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

  // returns whether given text is url
  function isURL(text) {
    if (text.includes(' ')) return false;
    let url;
    try {
      url = new URL(text);
    } catch {
      return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  // scroll to end of messages
  function chatScroll() {
    if (!messagesEnd.current) return;
    messagesEnd.current.scrollIntoView();
  }

  // send a message notification to the user
  function sendNotification(data) {
    // return if browser does not support notifications
    if (!('Notification' in window)) return;
    // return if permissions not granted
    if (!Notification.permission === 'granted') return;
    // send notification
    if (data) {
      const titleText = `New message from @${data.senderName}`;
      const bodyText = data.text ?? data.filename;
      new Notification(titleText, { body: bodyText, icon: logo });
    }
  }

  // called when page visibility changes
  function onVisChange() {
    pageHidden = document.hidden;
    // if page not hidden, reset title
    if (!pageHidden) document.title = 'Devcomms';
  }

  // when messages update
  useEffect(() => {
    // scroll if first scroll
    if (firstScroll && messages) {
      firstScroll = false;
      chatScroll(); // scroll chat
    }
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // on start
  useEffect(() => {
    // reset first scroll and query
    firstScroll = true;
    firstQuery = true;

    // ask for notification permissions
    if (Notification.permission === 'default') Notification.requestPermission();

    // create visibility listener on start
    document.addEventListener("visibilitychange", onVisChange);

    // listen for message creation
    const messagesListener = chatsRef.onSnapshot(snapshot => {
      // scroll chat
      chatScroll();
      // skip initial state of database
      if (firstQuery) {
        firstQuery = false;
        return;
      }
      // return if page not hidden
      if (!pageHidden) return;
      // for each new message
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          sendNotification(data);
          document.title = 'Devcomms (new)';
        }
      });
    });

    // clear listeners on return
    return () => {
      document.removeEventListener("visibilitychange", onVisChange);
      messagesListener();
    }
  }, [props.channel]); // eslint-disable-line react-hooks/exhaustive-deps

  // if no messages, load
  if (!messages) {
    return (
      <Filler type="loading" message="Loading messages..." />
    );
  }

  return (
    <div className="Chat">
      <div className="message-list">
        {
          (messages.length >= messageCount) &&
          <button
            onClick={() => setMessageCount(messageCount + messageChunk)}
            className="load-more-btn"
          >
            load more
          </button>
        }
        {
          messages.length ?
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
                    {
                      isURL(m.text) ?
                      <a href={m.text} target="_blank" rel="noreferrer noopener">
                        {m.text}
                      </a> :
                      <ReactMarkdown className="markdown-text">
                        {m.text}
                      </ReactMarkdown>
                    }
                    {
                      m.edited &&
                      <span className="edited-text">(edited)</span>
                    }
                  </> :
                  <a href={m.url} target="_blank" rel="noreferrer noopener">
                    {
                      m.type === 'image' ?
                      <img
                        src={m.url}
                        className="message-image"
                        alt={m.filename}
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
                              <a href={m.url} target="_blank" rel="noreferrer noopener">
                                {m.filename}
                              </a>
                            }
                          </div>
                          {
                            m.type !== 'text' &&
                            <button
                              style={{margin: '0 0 10px 0'}}
                              onClick={() => downloadFile(m.url, m.filename)}
                            >
                              <GetAppIcon />
                            </button>
                          }
                          <hr style={{margin: '0 0 10px 0'}} />
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
        <span ref={messagesEnd} />
      </div>
      <form onSubmit={e => {
        e.preventDefault();
        addMessage();
      }}>
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
