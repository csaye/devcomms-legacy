import React, { useEffect, useState } from 'react';

import Groups from '../Groups/Groups.js';
import Header from '../Header/Header.js';
import Channels from '../Channels/Channels.js';
import Content from '../Content/Content.js';

import './Page.css';

function Page(props) {
  const [channel, setChannel] = useState(null);

  // clear channel when group changes
  useEffect(() => {
    setChannel(null);
  }, [props.group]);

  return (
    <div className="Page">
      <Header group={props.group} username={props.username} />
      <div className="page-content">
        <Groups group={props.group} />
        {
          props.group ?
          <>
            <Channels
              group={props.group}
              channel={channel}
              setChannel={setChannel}
            />
            <Content
              username={props.username}
              group={props.group}
              channel={channel}
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
