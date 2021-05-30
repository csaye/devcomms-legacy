import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';

import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import firebase from 'firebase/app';

import './Goal.css';

const SEC_MS = 1000;
const MIN_MS = SEC_MS * 60;
const HOUR_MS = MIN_MS * 60;
const DAY_MS = HOUR_MS * 24;

function Goal(props) {
  const { title, id, endAt } = props.data;
  const endDate = endAt.toDate();

  function formatDate(d) {
    let year = d.getFullYear().toString();
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  function formatTime(d) {
    let hour = d.getHours().toString();
    let minute = d.getMinutes().toString();

    if (hour.length < 2) hour = '0' + hour;
    if (minute.length < 2) minute = '0' + minute;

    return [hour, minute].join(':');
  }

  const [deleting, setDeleting] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newEndDate, setNewEndDate] = useState(formatDate(endDate));
  const [newEndTime, setNewEndTime] = useState(formatTime(endDate));

  const [timeLeft, setTimeLeft] = useState(endDate - new Date());

  const groupRef = firebase.firestore().collection('groups').doc(props.groupId);
  const goalsRef = groupRef.collection('goals');
  const goalRef = goalsRef.doc(id);

  // deletes goal document from firebase
  async function deleteGoal() {
    await goalRef.delete();
  }

  // creates a goal document in firebase
  function updateGoal() {
    const endDateTime = new Date(`${newEndDate} ${newEndTime}`);

    // add document to firebase
    goalRef.update({
      endAt: endDateTime,
      title: newTitle
    });
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
      <h1>{title}</h1>
      <p className="end-date">
        {`${endDate.toDateString()}, ${endDate.toLocaleTimeString()}`}
      </p>
      <p className="time-left">
        {
          timeLeft >= 0 ?
          <>
            {timeLeft > DAY_MS && <>{Math.floor(timeLeft / DAY_MS)}<span className="time-icon">d</span></>}
            {timeLeft > HOUR_MS && <>{Math.floor(timeLeft % DAY_MS / HOUR_MS)}<span className="time-icon">h</span></>}
            {timeLeft > MIN_MS && <>{Math.floor(timeLeft % DAY_MS % HOUR_MS / MIN_MS)}<span className="time-icon">m</span></>}
            {Math.floor(timeLeft % DAY_MS % HOUR_MS % MIN_MS / SEC_MS)}<span className="time-icon">s</span>
          </> :
          <span className="overdue-text">
            {-timeLeft > DAY_MS && <>{Math.floor(-timeLeft / DAY_MS)}<span className="time-icon">d</span></>}
            {-timeLeft > HOUR_MS && <>{Math.floor(-timeLeft % DAY_MS / HOUR_MS)}<span className="time-icon">h</span></>}
            {-timeLeft > MIN_MS && <>{Math.floor(-timeLeft % DAY_MS % HOUR_MS / MIN_MS)}<span className="time-icon">m</span></>}
            {Math.floor(-timeLeft % DAY_MS % HOUR_MS % MIN_MS / SEC_MS)}<span className="time-icon">s</span>
            {' '}ago
          </span>
        }
      </p>
      <Popup
        trigger={
          <button className="delete-button">
            <EditIcon className="edit-icon" />
          </button>
        }
        modal
      >
        {
          close => (
            <div className="modal">
              <button className="close" onClick={close}>&times;</button>
              <div className="header">Editing Todo</div>
              <div className="content">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    updateGoal();
                    close();
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <label htmlFor="goal-newtitle">Title</label>
                  <input
                    id="goal-newtitle"
                    placeholder="title"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                  />
                  <label htmlFor="goal-newdate">Date</label>
                  <input
                    id="goal-newdate"
                    type="date"
                    value={newEndDate}
                    onChange={e => setNewEndDate(e.target.value)}
                    required
                  />
                  <label htmlFor="goal-newtime">Time</label>
                  <input
                    id="goal-newtime"
                    type="time"
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    style={{width: '148px'}}
                    required
                  />
                  <button
                    type="submit"
                    style={{margin: '10px 0 0 0'}}
                  >
                    <CheckIcon />
                  </button>
                </form>
              </div>
              <hr style={{margin: '0 0 10px 0'}} />
              {
                deleting ?
                <>
                  <p className="delete-text">Delete goal?</p>
                  <button onClick={() => setDeleting(false)} style={{"marginRight": "5px"}}>
                    cancel
                  </button>
                  <button onClick={() => {
                    deleteGoal();
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
                >
                  <DeleteIcon />
                </button>
              }
            </div>
          )
        }
      </Popup>
    </div>
  );
}

export default Goal;
