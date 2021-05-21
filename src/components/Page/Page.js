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
        <Chat />
        <div>
          <Notes />
          <Goals />
        </div>
        <Sketch />
        <Todos />
      </div>
    </div>
  );
}

export default Page;
