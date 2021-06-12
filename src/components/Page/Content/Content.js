import Chat from '../Channels/Chat/Chat.js';
import Sketch from '../Channels/Sketch/Sketch.js';
import Notes from '../Channels/Notes/Notes.js';
import Todos from '../Channels/Todos/Todos.js';
import Goals from '../Channels/Goals/Goals.js';

import './Content.css';

function Content(props) {
  // gets channel component
  function getChannel(channel) {
    switch (channel.type) {
      case 'text': return <Chat username={props.username} group={props.group} channel={channel.id} />;
      case 'sketch': return <Sketch group={props.group} channel={channel.id} />;
      case 'notes': return <Notes group={props.group} channel={channel.id} />;
      case 'todos': return <Todos group={props.group} channel={channel.id} />;
      case 'goals': return <Goals group={props.group} channel={channel.id} />;
      default: return null;
    }
  }

  return (
    <div className="Content">
      {
        props.channel ?
        <>
          {getChannel(props.channel)}
        </> :
        <p className="no-channel-text">No channel selected</p>
      }
    </div>
  );
}

export default Content;
