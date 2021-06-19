import React, { useEffect, useState } from 'react';

import Filler from '../../Filler/Filler.js';
import Chat from '../Channels/Chat/Chat.js';
import Sketch from '../Channels/Sketch/Sketch.js';
import Notes from '../Channels/Notes/Notes.js';
import Todos from '../Channels/Todos/Todos.js';
import Goals from '../Channels/Goals/Goals.js';
import Stream from '../Channels/Stream/Stream.js';

import firebase from 'firebase/app';

import './Content.css';

function Content(props) {
  const [channelComponent, setChannelComponent] = useState(undefined);

  // gets channel component by type
  function getChannelComponent(type) {
    switch (type) {
      case 'text': return <Chat username={props.username} group={props.group} channel={props.channel} />;
      case 'sketch': return <Sketch group={props.group} channel={props.channel} />;
      case 'notes': return <Notes group={props.group} channel={props.channel} />;
      case 'todos': return <Todos group={props.group} channel={props.channel} />;
      case 'goals': return <Goals group={props.group} channel={props.channel} />;
      case 'audio': return <Stream username={props.username} useVideo={false} group={props.group} channel={props.channel} />;
      case 'video': return <Stream username={props.username} useVideo={true} group={props.group} channel={props.channel} />;
      default: return <Filler type="nodata" message="No channel selected" />;
    }
  }

  // gets channel component
  async function getChannel() {
    setChannelComponent(undefined);
    // retrieve channel type
    const groupDoc = firebase.firestore().collection('groups').doc(props.group);
    const channelDoc = groupDoc.collection('channels').doc(props.channel);
    const doc = await channelDoc.get();
    const type = doc.exists ? doc.data().type : undefined;
    // set corresponding component
    const component = getChannelComponent(type);
    setChannelComponent(component);
  }

  useEffect(() => {
    getChannel();
  }, [props.channel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Content">
      {
        channelComponent ?? <Filler type="loading" message="Loading channel..." />
      }
    </div>
  );
}

export default Content;
