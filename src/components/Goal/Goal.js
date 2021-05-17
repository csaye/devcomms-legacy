import React, { useEffect, useState } from 'react';

import CheckIcon from '@material-ui/icons/Check';

import firebase from 'firebase/app';

import './Goal.css';

const SEC_MS = 1000;
const MIN_MS = SEC_MS * 60;
const HOUR_MS = MIN_MS * 60;
const DAY_MS = HOUR_MS * 24;

function Goal(props) {
  const { text, id, endAt } = props.data;
  const endDate = endAt.toDate();

  const [timeLeft, setTimeLeft] = useState(endDate - new Date());

  const goalsRef = firebase.firestore().collection('goals');

  // deletes goal document from firebase
  async function deleteGoal() {
    await goalsRef.doc(id).delete();
  }

  useEffect(() => {
    // update time left every tenth of a second
    setTimeLeft(endDate - new Date());
    const interval = setInterval(() => {
      setTimeLeft(endDate - new Date());
    }, 100);
    return () => clearInterval(interval);
  }, [endAt]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="Goal">
      <h1>{text}</h1>
      <p className="end-date">
        {`${endDate.toDateString()}, ${endDate.toLocaleTimeString()}`}
      </p>
      <p className="time-left">
        {Math.floor(timeLeft / DAY_MS)}<span className="time-icon">d</span>
        {Math.floor(timeLeft % DAY_MS / HOUR_MS)}<span className="time-icon">h</span>
        {Math.floor(timeLeft % DAY_MS % HOUR_MS / MIN_MS)}<span className="time-icon">m</span>
        {Math.floor(timeLeft % DAY_MS % HOUR_MS % MIN_MS / SEC_MS)}<span className="time-icon">s</span>
      </p>
      <button onClick={deleteGoal}>
        <CheckIcon />
      </button>
    </div>
  );
}

export default Goal;
