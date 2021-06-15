import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';

import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';

import './Groups.css';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

function Groups(props) {
  const [groupName, setGroupName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [member, setMember] = useState('');
  const [addError, setAddError] = useState('');

  // get user doc
  const uid = firebase.auth().currentUser.uid;
  const userDoc = firebase.firestore().collection('users').doc(uid);

  // get user groups
  const groupsRef = firebase.firestore().collection('groups');
  const groupsQuery = groupsRef.where('members', 'array-contains', uid).orderBy('name');
  const [groups] = useCollectionData(groupsQuery, { idField: 'id' });

  // get usernames data
  const usernamesRef = firebase.firestore().collection('usernames');
  const [usernamesData] = useCollectionData(usernamesRef);

  // selects given group for current user
  async function selectGroup(group) {
    await userDoc.update({
      group: group.id
    });
  }

  // creates a group with given name
  async function createGroup() {
    // create group document
    await groupsRef.add({
      name: groupName,
      owner: uid,
      members: [uid]
    }).then(doc => {
      // get group id
      const groupId = doc.id;
      // set current user group to this
      userDoc.update({
        group: groupId
      });
    });
  }

  // checks whether user group valid
  function checkUserGroup() {
    if (!groups) return;
    // if no group where id is group
    if (!groups.some(g => g.id === props.group)) {
      // clear current group
      userDoc.update({
        group: ''
      });
    }
  }

  // deletes given group
  async function deleteGroup(group) {
    // delete all channels
    const batch = firebase.firestore().batch();
    const groupDoc = groupsRef.doc(group.id);
    await groupDoc.collection('channels').get().then(docs => {
      docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    });
    batch.delete(groupDoc); // delete group document
    batch.commit(); // commit batch
    // delete channel cache
    await userDoc.update({
      [`channels.${group.id}`]: firebase.firestore.FieldValue.delete()
    });
  }

  // updates group document in firebase
  async function updateGroup(group) {
    const groupDoc = groupsRef.doc(group.id);
    await groupDoc.update({
      name: newGroupName
    });
  }

  // gets a username from user id
  function getUsername(userId) {
    if (!usernamesData) return '...';
    const matches = usernamesData.filter(user => user.uid === userId);
    return matches.length === 0 ? null : matches[0].username;
  }

  // adds member to group
  async function addMember(group) {
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
    const groupDoc = groupsRef.doc(group.id);
    await groupDoc.update({
      members: firebase.firestore.FieldValue.arrayUnion(memberUid)
    });
  }

  // removes given member
  async function removeMember(group, member) {
    // update document in firebase
    const groupDoc = groupsRef.doc(group.id);
    await groupDoc.update({
      members: firebase.firestore.FieldValue.arrayRemove(member)
    });
  }

  // check user group when groups change
  useEffect(() => {
    checkUserGroup();
  }, [groups]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!groups) {
    return (
      <div className="Groups" />
    );
  }

  return (
    <div className="Groups">
      {
        groups.map((group, i) =>
          <Popup
            key={`groups-button-${i}`}
            trigger={
              <button
                className={
                  props.group === group.id ? 'group-btn selected' : 'group-btn'
                }
                onClick={() => selectGroup(group)}
              >
                {group.name}
              </button>
            }
            on={group.owner === uid ? 'right-click' : ''}
            position="right center"
            arrow={false}
            nested
          >
            {
              close => (
                <>
                  <Popup
                    nested
                    onClose={close}
                    trigger={
                      <EditIcon style={{cursor: 'pointer'}} />
                    }
                    onOpen={() => {
                      setNewGroupName(group.name);
                    }}
                    modal
                  >
                    <div className="modal">
                      <button className="close" onClick={close}>&times;</button>
                      <div className="header">
                        Editing
                        <GroupIcon style={{marginLeft: '5px'}} />
                        {group.name}
                      </div>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          updateGroup(group);
                          close();
                        }}
                      >
                        <input
                          placeholder="group name"
                          spellCheck="false"
                          value={newGroupName}
                          onChange={e => setNewGroupName(e.target.value)}
                          required
                        />
                        <button
                          type="submit"
                          style={{
                            marginLeft: '5px', marginTop: '5px',
                            position: 'relative', top: '4px'
                          }}
                        >
                          <CheckIcon />
                        </button>
                      </form>
                    </div>
                  </Popup>
                  <Popup
                    nested
                    onClose={close}
                    trigger={
                      <GroupIcon style={{cursor: 'pointer'}} />
                    }
                    modal
                  >
                    <div className="modal">
                      <button className="close" onClick={close}>&times;</button>
                      <div className="header">
                        Members of
                        <GroupIcon style={{marginLeft: '5px'}} />
                        {group.name}
                      </div>
                      <div style={{marginTop: '5px'}}>
                        {
                          group.members.sort().map((m, i) =>
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
                                  onClick={() => removeMember(group, m)}
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
                      </div>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          addMember(group);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <input
                          placeholder="username"
                          spellCheck="false"
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
                        addError &&
                        <p
                          className="error-text"
                          style={{margin: '5px 0'}}
                        >
                          {addError}
                        </p>
                      }
                    </div>
                  </Popup>
                  <Popup
                    nested
                    onClose={close}
                    trigger={
                      <DeleteIcon style={{cursor: 'pointer'}} />
                    }
                    modal
                  >
                    <div className="modal">
                      <button className="close" onClick={close}>&times;</button>
                      <div className="header">
                        Delete
                        <GroupIcon style={{marginLeft: '5px'}} />
                        {group.name}?
                      </div>
                      <button
                        onClick={close}
                        style={{
                          padding: '5px 10px', marginTop: '10px'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          deleteGroup(group);
                          close();
                        }}
                        style={{
                          padding: '5px 10px', marginTop: '10px', marginLeft: '10px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </Popup>
                </>
              )
            }
          </Popup>
        )
      }
      <Popup
        trigger={
          <button className="group-btn">
            <AddIcon />
          </button>
        }
        onOpen={() => {
          setGroupName('');
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
                New Group
                <GroupIcon style={{marginLeft: '5px'}} />
              </div>
              <form onSubmit={e => {
                e.preventDefault();
                createGroup().then(close);
              }}>
                <input
                  placeholder="group name"
                  spellCheck="false"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  required
                />
                <button
                  className="clean-btn"
                  style={{
                    marginLeft: '5px', marginTop: '5px',
                    position: 'relative', top: '4px'
                  }}
                >
                  <AddIcon />
                </button>
              </form>
            </div>
          )
        }
      </Popup>
    </div>
  );
}

export default Groups;
