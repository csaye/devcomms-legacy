import React, { useEffect, useState } from 'react';

import firebase from 'firebase/app';

import './Groups.css';

function Groups() {
  const [groups, setGroups] = useState(undefined);

  const uid = firebase.auth().currentUser.uid;
  const userRef = firebase.firestore().collection('users').doc(uid);

  // updates current user group in firebase
  async function selectGroup(group) {
    await userRef.update({
      currentGroup: group
    });
  }

  // retrieves current user groups from firebase
  async function getGroups() {
    await userRef.get().then(doc => {
      const docData = doc.data();
      setGroups(docData.groups);
    });
  }

  useEffect(() => {
    getGroups();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Groups">
      <h1>Select Group</h1>
      {
        groups ?
        groups.map((g, i) =>
          <button onClick={() => selectGroup(g)} className={`group-${i}`}>
            {g}
          </button>
        ) :
        <p>Retrieving groups...</p>
      }
    </div>
  );
}

export default Groups;
