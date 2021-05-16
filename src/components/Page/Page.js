import Chat from '../Chat/Chat.js';
import Header from '../Header/Header.js';
import Notes from '../Notes/Notes.js';
import Goals from '../Goals/Goals.js';
import Sketch from '../Sketch/Sketch.js';
import Image from '../Image/Image.js';

import './Page.css';

function Page() {
  return (
    <div className="Page">
      <Header />
      <div className="page-content flex-grow">
        <Chat />
        <div>
          <Notes />
          <Goals />
        </div>
        <Sketch />
        <Image />
      </div>
    </div>
  );
}

export default Page;
