import React, { useState } from 'react';

import Todo from '../Todo/Todo.js';

import AddIcon from '@material-ui/icons/Add';
import ListIcon from '@material-ui/icons/List';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './Todos.css';

function Todos(props) {
  // get todos reference
  const groupRef = firebase.firestore().collection('groups').doc(props.groupId);
  const todosRef = groupRef.collection('todos');
  const [todos] = useCollectionData(
    todosRef.orderBy('priority'), { idField: 'id' }
  );

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('0');

  // creates a todo document in firebase
  async function createTodo(e) {
    e.preventDefault();

    // get todo values
    const todoTitle = title;
    const todoPriority = parseFloat(priority);

    // reset todo values
    setTitle('');
    setPriority('0');

    // create document in firebase
    await todosRef.add({
      title: todoTitle,
      priority: todoPriority
    })
  }

  return (
    <div className="Todos">
      <h1><ListIcon /> Todos</h1>
      <hr />
      <form onSubmit={createTodo}>
        <label htmlFor="todos-title">Title</label>
        <input
          id="todos-title"
          placeholder="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <label htmlFor="todos-priority">Priority</label>
        <input
          id="todos-priority"
          placeholder="priority"
          type="number"
          value={priority}
          onChange={e => setPriority(e.target.value)}
          required
        />
        <button type="submit" className="submit-button">
          <AddIcon />
        </button>
      </form>
      <hr />
      <div>
        {
          todos ?
          <>
            {
              todos.length > 0 ?
              todos.map((t, i) =>
                <Todo key={`todo-${i}`} data={t} groupId={props.groupId} />
              ) :
              <p>No todos yet.</p>
            }
          </> :
          <p>Retrieving todos...</p>
        }
      </div>
    </div>
  );
}

export default Todos;
