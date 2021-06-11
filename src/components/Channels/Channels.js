import React, { useState } from 'react';

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

import './Channels.css';

function Channels(props) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [newName, setNewName] = useState('');

  // get group channels
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const channelsRef = groupDoc.collection('channels');
  const [channels] = useCollectionData(channelsRef, { idField: 'id' });

  // returns icon for requested channel type
  function getIcon(type) {
    switch (type) {
      case 'text': return <ChatIcon />;
      case 'sketch': return <BrushIcon />;
      case 'notes': return <DescriptionIcon />;
      case 'todos': return <ListIcon />;
      case 'goals': return <LibraryAddCheckIcon />;
      default: return null;
    }
  }

  // creates a channel in firebase
  async function createChannel() {
    await channelsRef.add({
      name: name,
      type: type
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

  return (
    <div className="Channels">
      {
        (channels && channels.length > 0) ?
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
                onClick={() => props.setChannel(channel)}
              >
                {getIcon(channel.type)} {channel.name}
              </button>
            }
            on="right-click"
            position="right top"
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
                      <div className="header">Editing {channel.name}</div>
                      <form onSubmit={e => {
                        e.preventDefault();
                        updateChannel(channel);
                        close();
                      }}>
                        <input
                          placeholder="channel name"
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
                      <div className="header">Delete {channel.name}?</div>
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
        ) :
        <p className="no-channels-text">No channels yet</p>
      }
      <Popup
        trigger={
          <button className="add-button clean-btn2">
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
              <div className="header">New Channel</div>
              <form onSubmit={e => {
                e.preventDefault();
                createChannel();
                close();
              }}>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  required
                >
                  <option value="text">Text</option>
                  <option value="sketch">Sketch</option>
                  <option value="notes">Notes</option>
                  <option value="todos">Todos</option>
                  <option value="goals">Goals</option>
                </select>
                <input
                  placeholder="channel name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <button>
                  <AddIcon />
                </button>
              </form>
            </div>
          )
        }
      </Popup>
    </div>
  );
}

export default Channels;
