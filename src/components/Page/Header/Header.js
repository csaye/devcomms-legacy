import React, { useState } from 'react';

import Popup from 'reactjs-popup';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';
import VerticalSplitIcon from '@material-ui/icons/VerticalSplit';

import firebase from 'firebase/app';

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import logo from '../../../img/logo.png';
import './Header.css';

function Header(props) {
  const [newGroupName, setNewGroupName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [addError, setAddError] = useState('');
  const [member, setMember] = useState('');

  const [newUsername, setNewUsername] = useState(props.username);
  const [usernameError, setUsernameError] = useState('');

  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);
  const usernameDoc = firebase.firestore().collection('usernames').doc(uid);

  // get group data
  const groupDoc = firebase.firestore().collection('groups').doc(
    props.group ? props.group : 'null'
  );
  const [groupData] = useDocumentData(groupDoc);

  // get channel data
  const channelDoc = props.group ?
  groupDoc.collection('channels').doc(props.channel ?? 'null') :
  groupDoc;
  const [channelData] = useDocumentData(channelDoc);

  // get usernames data
  const usernamesRef = firebase.firestore().collection('usernames');
  const [usernamesData] = useCollectionData(usernamesRef);

  // clears selected group of current user
  async function leaveGroup() {
    await userDoc.update({
      group: ''
    });
  }

  // updates group document in firebase
  async function updateGroup() {
    await groupDoc.update({
      name: newGroupName
    });
  }

  // adds member to group
  async function addMember() {
    const newMember = member;
    setMember('');
    // retrieve new member uid
    const matches = usernamesData.filter(user => user.username === newMember);
    if (matches.length === 0) {
      setAddError(`No user @${newMember} found`)
      setTimeout(() => setAddError(''), 2000);
      return;
    }
    const memberUid = matches[0].uid;
    // update document in firebase
    await groupDoc.update({
      members: firebase.firestore.FieldValue.arrayUnion(memberUid)
    });
  }

  // removes given member
  async function removeMember(member) {
    // update document in firebase
    await groupDoc.update({
      members: firebase.firestore.FieldValue.arrayRemove(member)
    });
  }

  // deletes group
  async function deleteGroup() {
    // delete all channels
    const batch = firebase.firestore().batch();
    await groupDoc.collection('channels').get().then(docs => {
      docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    });
    batch.delete(groupDoc); // delete group document
    batch.commit(); // commit batch
    // delete channel cache
    await userDoc.update({
      [`channels.${props.group}`]: firebase.firestore.FieldValue.delete()
    });
  }

  // gets a username from user id
  function getUsername(userId) {
    if (!usernamesData) return '...';
    const matches = usernamesData.filter(user => user.uid === userId);
    return matches.length === 0 ? null : matches[0].username;
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
      <h1>Devcomms</h1>
      <span className="flex-grow" />
      <Popup
        trigger={
          <div className="flex-item">
            <PersonIcon />@{props.username}
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
        (groupData && groupData.owner === uid) &&
        <Popup
          trigger={
            <div className="flex-item">
              <GroupIcon />{groupData.name}
            </div>
          }
          onOpen={() => {
            setNewGroupName(groupData.name);
          }}
          modal
        >
          {
            close => (
              <div className="modal">
                <button className="close" onClick={close}>&times;</button>
                <div className="header">
                  Editing
                  <GroupIcon style={{marginLeft: '5px'}} />
                  {groupData.name}
                </div>
                <form
                  style={{
                    margin: '0 0 20px 0'
                  }}
                  onSubmit={e => {
                    e.preventDefault();
                    updateGroup();
                    close();
                  }}
                >
                  <input
                    placeholder="group name"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    style={{
                      marginLeft: '5px', marginTop: '10px',
                      position: 'relative', top: '5px'
                    }}
                  >
                    <CheckIcon />
                  </button>
                </form>
                <hr />
                {
                  groupData.members.sort().map((m, i) =>
                    <div
                      key={`groupmember-${i}`}
                      style={{
                        height: '30px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <PersonIcon/> {getUsername(m)}
                      {
                        m !== uid &&
                        <button
                          onClick={() => removeMember(m)}
                          style={{
                            border: '0',
                            background: 'transparent',
                            margin: '0', padding: '0'
                          }}
                        >
                          <DeleteIcon />
                        </button>
                      }
                    </div>
                  )
                }
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    addMember();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <input
                    placeholder="username"
                    value={member}
                    onChange={e => setMember(e.target.value)}
                    style={{
                      marginRight: '5px'
                    }}
                    required
                  />
                  <button type="submit"><AddIcon /></button>
                </form>
                {
                  addError && <p
                    className="error-text"
                    style={{margin: '5px 0'}}
                    >
                      {addError}
                    </p>
                }
                <hr style={{marginBottom: '0'}} />
                {
                  deleting ?
                  <>
                    <p className="delete-text">Delete group?</p>
                    <button onClick={() => setDeleting(false)} style={{"marginRight": "5px"}}>
                      cancel
                    </button>
                    <button onClick={() => {
                      deleteGroup();
                      close();
                      setDeleting(false);
                    }}>
                      delete
                    </button>
                  </> :
                  <button
                    className="button"
                    onClick={() => {
                      setDeleting(true);
                    }}
                    style={{
                      marginTop: '10px'
                    }}
                  >
                    <DeleteIcon />
                  </button>
                }
              </div>
            )
          }
        </Popup>
      }
      {
        channelData &&
        <Popup
          trigger={
            <div className="flex-item">
              <VerticalSplitIcon />{channelData.name}
            </div>
          }
          modal
        >
          {
            close => (
              <div className="modal">
                <button className="close" onClick={close}>&times;</button>
                <div className="header">
                  Editing
                  <VerticalSplitIcon style={{marginLeft: '5px'}} />
                  {channelData.name}
                </div>
              </div>
            )
          }
        </Popup>
      }
      <button onClick={() => firebase.auth().signOut()} className="sign-out-button clean-btn">
        <ExitToAppIcon />
      </button>
    </div>
  );
}

export default Header;
