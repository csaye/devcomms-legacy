import CheckIcon from '@material-ui/icons/Check';

import firebase from 'firebase/app';

import './Todo.css';

function Todo(props) {
  const { id, title, priority } = props.data;

  const groupRef = firebase.firestore().collection('groups').doc(props.group);
  const todosRef = groupRef.collection('todos');

  // deletes todo from firebase
  async function deleteTodo() {
    await todosRef.doc(id).delete();
  }

  return (
    <div className="Todo">
      <h1>{title}</h1>
      <p className="priority-text">#{priority}</p>
      <button onClick={deleteTodo} className="delete-button">
        <CheckIcon className="check-icon" />
      </button>
    </div>
  );
}

export default Todo;
