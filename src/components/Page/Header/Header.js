import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import Popup from 'reactjs-popup';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import CheckIcon from '@material-ui/icons/Check';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';

import firebase from 'firebase/app';

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { getIcon } from '../Channels/Channels.js';

import logo from '../../../img/logo.png';
import banner from '../../../img/banner.png';
import './Header.css';

function Header(props) {
  const [newUsername, setNewUsername] = useState(props.username);
  const [usernameError, setUsernameError] = useState('');

  const history = useHistory();

  // get user data
  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);
  const usernameDoc = firebase.firestore().collection('usernames').doc(uid);

  // get group data
  const groupDoc = firebase.firestore().collection('groups').doc(
    props.group ?? 'null'
  );
  const [groupData] = useDocumentData(groupDoc);

  // get channel data
  const channelDoc = props.group ?
  groupDoc.collection('channels').doc(
    props.channel ? props.channel : 'null'
  ) : groupDoc;
  const [channelData] = useDocumentData(channelDoc);

  // get usernames data
  const usernamesRef = firebase.firestore().collection('usernames');
  const [usernamesData] = useCollectionData(usernamesRef);

  // clears selected group of current user
  async function leaveGroup() {
    props.setGroup(null);
    await userDoc.update({ group: '' });
    history.push('/home');
  }

  // attempts to update username
  async function updateUsername() {
    const username = newUsername;

    // verify username chars
    if (!/^[A-Za-z0-9_]+$/.test(username)) {
      setUsernameError("Username can only contain alphanumeric characters and underscore.");
      return false;
    }
    // verify username length
    if (username.length < 2 || username.length > 16) {
      setUsernameError("Username must be between 2 and 16 characters.");
      return false;
    }
    // verify username availability
    if (usernamesData.some(user => user.username.toLowerCase() === username.toLowerCase())) {
      setUsernameError("Username taken. Please try another.");
      return false;
    }

    // update firebase documents
    await userDoc.update({ username: username });
    await usernameDoc.update({ username: username });
    return true;
  }

  return (
    <div className="Header">
      <img
        onClick={leaveGroup}
        className="logo-img"
        src={logo}
        alt="logo"
      />
      <span className="divider" />
      <img src={banner} className="banner" alt="banner" />
      <span className="flex-grow" />
      <Popup
        trigger={
          <div className="flex-item">
            <PersonIcon /><span>@{props.username}</span>
          </div>
        }
        onOpen={() => {
          setUsernameError('');
          setNewUsername(props.username);
        }}
        modal
      >
        {
          close => (
            <div className="modal">
              <button className="close" onClick={close}>&times;</button>
              <div className="header">Editing Profile</div>
              <form onSubmit={e => {
                e.preventDefault();
                updateUsername().then(updated => {
                  if (updated) close();
                });
              }}>
                <input
                  placeholder="username"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  required
                />
                <button style={{marginLeft: '5px', position: 'relative', top: '5px'}}>
                  <CheckIcon />
                </button>
                {usernameError && <p style={{color: 'red', margin: '10px 0 0 0'}}>{usernameError}</p>}
              </form>
            </div>
          )
        }
      </Popup>
      {
        groupData &&
        <div className="flex-item">
          <GroupIcon /><span>{groupData.name}</span>
        </div>
      }
      {
        channelData &&
        <div className="flex-item">
          {getIcon(channelData.type)}<span>{channelData.name}</span>
        </div>
      }
      <button onClick={() => firebase.auth().signOut()} className="sign-out-button clean-btn">
        <ExitToAppIcon />
      </button>
    </div>
  );
}

export default Header;
