import './Todo.css';

function Todo(props) {
  const { title, priority } = props.data;

  return (
    <div className="Todo">
      <h1>{title}</h1>
      <p className="priority-text">{priority}</p>
    </div>
  );
}

export default Todo;
