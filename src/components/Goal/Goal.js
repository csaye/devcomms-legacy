import DeleteIcon from '@material-ui/icons/Delete';

import firebase from 'firebase/app';

import './Goal.css';

function Goal(props) {
  const { text, id, endAt } = props.data;
  const endDate = endAt.toDate();

  const goalsRef = firebase.firestore().collection('goals');

  // deletes goal document from firebase
  async function deleteGoal() {
    await goalsRef.doc(id).delete();
  }

  return (
    <div className="Goal">
      <p>{text}</p>
      <p>{`${endDate.toLocaleDateString()}, ${endDate.toLocaleTimeString()}`}</p>
      <button onClick={deleteGoal}>
        <DeleteIcon />
      </button>
    </div>
  );
}

export default Goal;
