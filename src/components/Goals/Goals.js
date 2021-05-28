import React, { useState } from 'react';

import Goal from '../Goal/Goal.js';
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
import AddIcon from '@material-ui/icons/Add';

import firebase from 'firebase/app';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import './Goals.css';

function Goals(props) {
  const [text, setText] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  // get goals
  const groupRef = firebase.firestore().collection('groups').doc(props.group);
  const goalsRef = groupRef.collection('goals');
  const goalsQuery = goalsRef.orderBy('endAt');
  const [goals] = useCollectionData(goalsQuery, { idField: 'id' });

  // creates a goal document in firebase
  function addGoal(e) {
    e.preventDefault();
    const goalText = text;
    setText('');
    const endDateTime = new Date(`${endDate} ${endTime}`);
    setEndDate('');
    setEndTime('');

    // add document to firebase
    goalsRef.add({
      endAt: endDateTime,
      text: goalText
    });
  }

  return (
    <div className="Goals">
      <h1><LibraryAddCheckIcon /> Goals</h1>
      <form onSubmit={addGoal}>
        <input
          placeholder="title"
          className="title-input"
          value={text}
          onChange={e => setText(e.target.value)}
          required
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          required
        />
        <input
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          required
        />
        <button type="submit" className="create-button">
          <AddIcon />
        </button>
      </form>
      <div className="goal-list">
      {
        goals ?
        <>
          {
            goals.length > 0 ?
            goals.map((g, i) =>
              <Goal key={`goal-${i}`} data={g} group={props.group} />
            ) :
            <p>No goals yet.</p>
          }
        </> :
        <p>Loading goals...</p>
      }
      </div>
    </div>
  );
}

export default Goals;
