import Groups from '../Groups/Groups.js';
import Header from '../Header/Header.js';
import Channels from '../Channels/Channels.js';
import Content from '../Content/Content.js';

import './Page.css';

function Page(props) {
  return (
    <div className="Page">
      <Header group={props.group} username={props.username} />
      <div className="page-content">
        <Groups />
        {
          props.group ?
          <>
            <Channels group={props.group} />
            <Content />
          </> :
          <p>No group selected</p>
        }
      </div>
    </div>
  );
}

export default Page;
