import Chat from '../Chat/Chat.js';
import Header from '../Header/Header.js';

import './Page.css';

function Page() {
  return (
    <div className="Page">
      <Header />
      <div className="page-content">
        <Chat />
      </div>
    </div>
  );
}

export default Page;
