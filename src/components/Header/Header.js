import React, { useState } from 'react';

import Popup from 'reactjs-popup';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';

import firebase from 'firebase/app';

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import logo from '../../img/logo.png';
import './Header.css';

function Header(props) {
  const [newGroupName, setNewGroupName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [addError, setAddError] = useState('');
  const [member, setMember] = useState('');

  const uid = firebase.auth().currentUser.uid;

  // get group data
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const [groupData] = useDocumentData(groupDoc);

  // get usernames data
  const usernamesRef = firebase.firestore().collection('usernames');
  const [usernamesData] = useCollectionData(usernamesRef);

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
    // delete each subcollection
    const batch = firebase.firestore().batch();
    const subcollections = ['chats', 'goals', 'notes', 'sketches', 'todos'];
    for (const subcollection of subcollections) {
      await groupDoc.collection(subcollection).get().then(docs => {
        docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      });
    }
    batch.delete(groupDoc); // delete group document
    batch.commit(); // commit batch
  }

  // gets a username from user id
  function getUsername(userId) {
    if (!usernamesData) return '...';
    const matches = usernamesData.filter(user => user.uid === userId);
    return matches.length === 0 ? null : matches[0].username;
  }

  return (
    <div className="Header">
      <img className="logo-img" src={logo} alt="logo" />
      <span className="divider" />
      <h1>Devcomms</h1>
      <span className="flex-grow" />
      <PersonIcon className="header-icon" />@{props.username}
      <GroupIcon className="header-icon" />{groupData ? groupData.name : '...'}
      {
        (groupData && groupData.owner === uid) &&
        <Popup
          trigger={
            <button className="group-button clean-btn edit-button">
              <EditIcon />
            </button>
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
                <div
                  className="header"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
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
                  <p style={{margin: '10px 0 0 0'}}><u>Group Name</u></p>
                  <input
                    placeholder="group name"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    style={{marginLeft: '5px', position: 'relative', top: '5px'}}
                  >
                    <CheckIcon />
                  </button>
                </form>
                <hr />
                <p style={{margin: '15px 0 5px 0'}}><u>Members</u></p>
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
                <hr />
                <p style={{margin: '15px 0 5px 0'}}><u>Add member</u></p>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    addMember();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center'
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
      <button onClick={() => firebase.auth().signOut()} className="sign-out-button clean-btn">
        <ExitToAppIcon />
      </button>
    </div>
  );
}

export default Header;
