import Chat from '../Chat/Chat.js';
import Header from '../Header/Header.js';
import Notes from '../Notes/Notes.js';
import Goals from '../Goals/Goals.js';
import Sketch from '../Sketch/Sketch.js';
import Todos from '../Todos/Todos.js';

import './Page.css';

function Page(props) {
  return (
    <div className="Page">
      <Header groupName={props.groupName} username={props.username} />
      <div className="page-content">
        <Chat groupId={props.groupId} username={props.username} />
        <div>
          <Notes groupId={props.groupId} />
          <Goals groupId={props.groupId} />
        </div>
        <Sketch groupId={props.groupId} />
        <Todos groupId={props.groupId} />
      </div>
    </div>
  );
}

export default Page;
