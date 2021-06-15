import React, { useEffect, useState } from 'react';

import Popup from 'reactjs-popup';

import firebase from 'firebase/app';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import ChatIcon from '@material-ui/icons/Chat';
import ListIcon from '@material-ui/icons/List';
import BrushIcon from '@material-ui/icons/Brush';
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
import DescriptionIcon from '@material-ui/icons/Description';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VideocamIcon from '@material-ui/icons/Videocam';

import './Channels.css';

// returns icon for requested channel type
export function getIcon(type) {
  switch (type) {
    case 'text': return <ChatIcon />;
    case 'sketch': return <BrushIcon />;
    case 'notes': return <DescriptionIcon />;
    case 'todos': return <ListIcon />;
    case 'goals': return <LibraryAddCheckIcon />;
    case 'audio': return <VolumeUpIcon />;
    case 'video': return <VideocamIcon />;
    default: return null;
  }
}

function Channels(props) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [newName, setNewName] = useState('');
  const [isOwner, setIsOwner] = useState(undefined);

  // get user doc
  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);

  // get group channels
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const channelsRef = groupDoc.collection('channels');
  const [channels] = useCollectionData(
    channelsRef.orderBy('name'), { idField: 'id' }
  );

  // creates a channel in firebase
  async function createChannel() {
    await channelsRef.add({
      name: name,
      type: type
    }).then(docRef => {
      // select channel
      const channelObj = {
        id: docRef.id,
        type: type
      }
      props.setChannel(channelObj);
      userDoc.update({
        [`channels.${props.group}`]: channelObj
      });
    });
  }

  // deletes given channel
  async function deleteChannel(channel) {
    const channelId = channel.id;
    if (props.channel?.id === channelId) props.setChannel(null);
    await channelsRef.doc(channelId).delete();
  }

  // updates channel name
  async function updateChannel(channel) {
    const channelId = channel.id;
    await channelsRef.doc(channelId).update({
      name: newName
    });
  }

  // selects given channel
  async function selectChannel(channel) {
    const channelObj = {
      id: channel.id,
      type: channel.type
    };
    props.setChannel(channelObj);
    await userDoc.update({
      [`channels.${props.group}`]: channelObj
    });
  }

  // retrieves whether user is owner
  async function getIsOwner() {
    const doc = await groupDoc.get();
    const owner = doc.data().owner;
    setIsOwner(uid === owner);
  }

  // retrieve whether user is owner on group change
  useEffect(() => {
    setIsOwner(undefined);
    getIsOwner();
  }, [props.group]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Channels">
      {
        (!channels || isOwner === undefined) ?
        <p className="placeholder-text">Loading channels...</p> :
        channels.length === 0 ?
        <p className="placeholder-text">No channels yet</p> :
        channels.map((channel, i) =>
          <Popup
            key={`channels-button-${i}`}
            trigger={
              <button
                className={
                  props.channel?.id === channel.id ?
                  'channel-button selected' :
                  'channel-button'
                }
                onClick={() => selectChannel(channel)}
              >
                {getIcon(channel.type)} <span>{channel.name}</span>
              </button>
            }
            on={isOwner ? 'right-click' : ''}
            position="right center"
            arrow={false}
            nested
          >
            {
              close => (
                <>
                  <Popup
                    nested
                    onClose={close}
                    trigger={
                      <EditIcon style={{cursor: 'pointer'}} />
                    }
                    onOpen={() => setNewName(channel.name)}
                    modal
                  >
                    <div className="modal">
                      <button className="close" onClick={close}>&times;</button>
                      <div className="header">
                        <span>Editing</span>
                        <span style={{marginLeft: '5px'}} />
                        {getIcon(channel.type)}
                        <span className="shrink">{channel.name}</span>
                      </div>
                      <form onSubmit={e => {
                        e.preventDefault();
                        updateChannel(channel);
                        close();
                      }}>
                        <input
                          placeholder="channel name"
                          spellCheck="false"
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          required
                        />
                        <button
                          style={{
                            marginLeft: '5px', marginTop: '5px',
                            position: 'relative', top: '4px'
                          }}
                        >
                          <CheckIcon />
                        </button>
                      </form>
                    </div>
                  </Popup>
                  <Popup
                    nested
                    onClose={close}
                    trigger={
                      <DeleteIcon style={{cursor: 'pointer'}} />
                    }
                    modal
                  >
                    <div className="modal">
                      <button className="close" onClick={close}>&times;</button>
                      <div className="header">
                        <span>Delete</span>
                        <span style={{marginLeft: '5px'}} />
                        {getIcon(channel.type)}
                        <span className="shrink">{channel.name}</span>?
                      </div>
                      <button
                        onClick={close}
                        style={{
                          padding: '5px 10px', marginTop: '10px'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          deleteChannel(channel);
                          close();
                        }}
                        style={{
                          padding: '5px 10px', marginTop: '10px', marginLeft: '10px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </Popup>
                </>
              )
            }
          </Popup>
        )
      }
      {
        (channels && isOwner) &&
        <Popup
          trigger={
            <button className="add-button clean-btn var2">
              <AddIcon />
            </button>
          }
          onOpen={() => {
            setType('text');
            setName('');
          }}
          modal
        >
          {
            close => (
              <div className="modal">
                <button className="close" onClick={close}>&times;</button>
                <div className="header">
                  New Channel
                  <AddIcon />
                </div>
                <form onSubmit={e => {
                  e.preventDefault();
                  createChannel();
                  close();
                }}>
                  <div
                    style={{
                      display: 'inline-block', position: 'relative',
                      top: '7px', marginRight: '5px'
                    }}
                  >
                    {getIcon(type)}
                  </div>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    style={{
                      cursor: 'pointer', outline: 'none',
                      margin: '10px auto 0 auto', background: 'var(--dark4)',
                      border: '1px solid var(--dark3)', color: 'var(--gray0)'
                    }}
                    required
                  >
                    <option value="text">Text</option>
                    <option value="sketch">Sketch</option>
                    <option value="notes">Notes</option>
                    <option value="todos">Todos</option>
                    <option value="goals">Goals</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                  <br />
                  <input
                    placeholder="channel name"
                    spellCheck="false"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <button
                    style={{
                      marginLeft: '5px', marginTop: '2px',
                      position: 'relative', top: '4px'
                    }}
                  >
                    <AddIcon />
                  </button>
                </form>
              </div>
            )
          }
        </Popup>
      }
    </div>
  );
}

export default Channels;
