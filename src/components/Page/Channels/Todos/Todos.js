import React, { useState } from 'react';

import Todo from './Todo/Todo.js';

import AddIcon from '@material-ui/icons/Add';
import ListIcon from '@material-ui/icons/List';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './Todos.css';

function Todos(props) {
  // get todos reference
  const groupDoc = firebase.firestore().collection('groups').doc(props.group);
  const channelDoc = groupDoc.collection('channels').doc(props.channel);
  const todosRef = channelDoc.collection('todos');
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

  if (!todos) {
    return (
      <div>
        <p className="channel-info">Loading...</p>
      </div>
    );
  }

  return (
    <div className="Todos">
      <h1><ListIcon /> Todos</h1>
      <form onSubmit={createTodo}>
        <label htmlFor="todos-title">Title</label>
        <input
          id="todos-title"
          autoComplete="off"
          spellCheck="false"
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
        <button type="submit" className="submit-button clean-btn var3">
          <AddIcon />
        </button>
      </form>
      <div>
        {
          todos.length > 0 ?
          todos.map((t, i) =>
            <Todo
              key={`todo-${i}`}
              data={t}
              group={props.group}
              channel={props.channel}
            />
          ) :
          <p>No todos yet.</p>
        }
      </div>
    </div>
  );
}

export default Todos;
