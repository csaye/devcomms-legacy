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
      <Header group={props.group} />
      <div className="page-content">
        <Chat group={props.group} />
        <div>
          <Notes group={props.group} />
          <Goals group={props.group} />
        </div>
        <Sketch group={props.group} />
        <Todos group={props.group} />
      </div>
    </div>
  );
}

export default Page;
