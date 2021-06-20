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
          userData={props.userData}
        />
        {
          props.group ?
          <>
            <Channels
              group={props.group}
              channel={props.channel}
            />
            <Content
              username={props.userData.username}
              group={props.group}
              channel={props.channel}
            />
          </> :
          <div className="nogroup">
            <Filler type="nodata" message="No group selected" />
          </div>
        }
      </div>
    </div>
  );
}

export default Page;
