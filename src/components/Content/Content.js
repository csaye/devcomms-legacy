import Chat from '../Chat/Chat.js';
// import Notes from '../Notes/Notes.js';
// import Goals from '../Goals/Goals.js';
// import Sketch from '../Sketch/Sketch.js';
// import Todos from '../Todos/Todos.js';

// import ListIcon from '@material-ui/icons/List';
// import BrushIcon from '@material-ui/icons/Brush';
// import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
// import DescriptionIcon from '@material-ui/icons/Description';

import './Content.css';

function Content(props) {
  // gets channel component
  function getChannel(channel) {
    switch (channel.type) {
      case 'text': return <Chat username={props.username} group={props.group} channel={channel.id} />;
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
