import React, { useState } from 'react';

import firebase from 'firebase/app';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import AddIcon from '@material-ui/icons/Add';

import './Channels.css';

function Channels(props) {
  const [name, setName] = useState('');

  // get group channels
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const channelsRef = groupDoc.collection('channels');
  const [channels] = useCollectionData(channelsRef, { idField: 'id' });

  // creates a channel in firebase
  async function createChannel(e) {
    e.preventDefault();
    await channelsRef.add({
      name: name
    });
  }

  return (
    <div className="Channels">
      {
        (channels && channels.length > 0) ?
        channels.map((channel, i) =>
          <button
            key={`channels-button-${i}`}
            onClick={() => props.setChannel(channel.id)}
          >
            {channel.name}
          </button>
        ) :
        <p>No channels yet</p>
      }
      <form onSubmit={createChannel}>
        <p><u>Create Channel</u></p>
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
  );
}

export default Channels;
