import Groups from './Groups/Groups.js';
import Header from './Header/Header.js';
import Channels from './Channels/Channels.js';
import Content from './Content/Content.js';

import './Page.css';

function Page(props) {
  return (
    <div className="Page">
      <Header group={props.group} channel={props.channel} username={props.username} />
      <div className="page-content">
        <Groups group={props.group} />
        {
          props.group ?
          <>
            <Channels
              group={props.group}
              channel={props.channel}
            />
            <Content
              username={props.username}
              group={props.group}
              channel={props.channel}
            />
          </> :
          <div className="nogroup">
            <p>No group selected</p>
          </div>
        }
      </div>
    </div>
  );
}

export default Page;
