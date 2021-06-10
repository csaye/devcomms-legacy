import Chat from '../Chat/Chat.js';
import Sketch from '../Sketch/Sketch.js';
// import Notes from '../Notes/Notes.js';
// import Goals from '../Goals/Goals.js';
// import Todos from '../Todos/Todos.js';

import './Content.css';

function Content(props) {
  // gets channel component
  function getChannel(channel) {
    switch (channel.type) {
      case 'text': return <Chat username={props.username} group={props.group} channel={channel.id} />;
      case 'sketch': return <Sketch group={props.group} channel={channel.id} /> 
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
        <p>No channel selected</p>
      }
    </div>
  );
}

export default Content;
