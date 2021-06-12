import React, { useEffect, useState } from 'react';

import Groups from '../Groups/Groups.js';
import Header from '../Header/Header.js';
import Channels from '../Channels/Channels.js';
import Content from '../Content/Content.js';

import firebase from 'firebase/app';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import './Page.css';

function Page(props) {
  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);
  const [userData] = useDocumentData(userDoc);

  const [channel, setChannel] = useState(null);

  // get new channel when group changes
  useEffect(() => {
    if (userData?.channels[props.group]) {
      setChannel(userData.channels[props.group]);
    } else setChannel(null);
  }, [props.group]); // eslint-disable-line react-hooks/exhaustive-deps

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
