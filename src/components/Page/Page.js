import Chat from '../Chat/Chat.js';
import Header from '../Header/Header.js';
import Notes from '../Notes/Notes.js';

import './Page.css';

function Page() {
  return (
    <div className="Page">
      <Header />
      <div className="page-content flex-grow">
        <Chat />
        <Notes />
      </div>
    </div>
  );
}

export default Page;
