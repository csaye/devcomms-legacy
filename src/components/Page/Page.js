import Groups from './Groups/Groups.js';
import Header from './Header/Header.js';
import Channels from './Channels/Channels.js';
import Content from './Content/Content.js';
import Filler from '../Filler/Filler.js';

import './Page.css';

function Page(props) {
  return (
    <div className="Page">
      <Header
        group={props.group}
        setGroup={props.setGroup}
        channel={props.channel}
        username={props.userData.username}
      />
      <div className="page-content">
        <Groups
          group={props.group}
          setGroup={props.setGroup}
          userData={props.userData}
        />
        {
          props.group ?
          <>
            <Channels
              group={props.group}
              channel={props.channel}
              setChannel={props.setChannel}
            />
            <Content
              username={props.userData.username}
              group={props.group}
              channel={props.channel}
            />
          </> :
          <div className="nogroup">
            {
              props.group === null ?
              <Filler type="nodata" message="No group selected" /> :
              <Filler type="loading" message="Loading group..." />
            }
          </div>
        }
      </div>
    </div>
  );
}

export default Page;
