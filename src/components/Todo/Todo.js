import CheckIcon from '@material-ui/icons/Check';

import firebase from 'firebase/app';

import './Todo.css';

function Todo(props) {
  const { id, title, priority } = props.data;

  // deletes todo from firebase
  async function deleteTodo() {
    await firebase.firestore().collection('todos').doc(id).delete();
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
