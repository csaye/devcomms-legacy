import React, { useState } from 'react';

import Popup from 'reactjs-popup';

import firebase from 'firebase/app';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import AddIcon from '@material-ui/icons/Add';
import ChatIcon from '@material-ui/icons/Chat';
import ListIcon from '@material-ui/icons/List';
import BrushIcon from '@material-ui/icons/Brush';
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
import DescriptionIcon from '@material-ui/icons/Description';

import './Channels.css';

function Channels(props) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');

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

  return (
    <div className="Channels">
      {
        (channels && channels.length > 0) ?
        channels.map((channel, i) =>
          <button
            key={`channels-button-${i}`}
            className={
              props.channel?.id === channel.id ?
              'channel-button selected' :
              'channel-button'
            }
            onClick={() => props.setChannel(channel)}
          >
            {getIcon(channel.type)} {channel.name}
          </button>
        ) :
        <p className="no-channels-text">No channels yet</p>
      }
      <Popup
        trigger={
          <button className="add-button">
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
