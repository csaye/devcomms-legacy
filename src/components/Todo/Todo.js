import React, { useState } from 'react';
import Popup from 'reactjs-popup';

import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import firebase from 'firebase/app';

import './Todo.css';

function Todo(props) {
  const { id, title, priority } = props.data;

  const [deleting, setDeleting] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newPriority, setNewPriority] = useState(priority);

  // get reference to todos collection
  const groupRef = firebase.firestore().collection('groups').doc(props.group);
  const todosRef = groupRef.collection('todos');
  const todoRef = todosRef.doc(id);

  // deletes todo from firebase
  async function deleteTodo() {
    await todoRef.delete();
  }

  // updates todo with new values
  async function updateTodo() {
    await todoRef.update({
      title: newTitle,
      priority: newPriority
    });
  }

  return (
    <div className="Todo">
      <h1>{title}</h1>
      <p className="priority-text">#{priority}</p>
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
                    updateTodo();
                    close();
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <label htmlFor="todos-newtitle">Title</label>
                  <input
                    id="todos-newtitle"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                  />
                  <label
                    htmlFor="todos-newpriority"
                    style={{marginTop: '5px'}}
                  >
                    Priority
                  </label>
                  <input
                    id="todos-newpriority"
                    type="number"
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
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
                  <p className="delete-text">Delete todo?</p>
                  <button onClick={() => setDeleting(false)} style={{"marginRight": "5px"}}>
                    cancel
                  </button>
                  <button onClick={() => {
                    deleteTodo();
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

export default Todo;
