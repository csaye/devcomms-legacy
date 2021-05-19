import './Todo.css';

function Todo(props) {
  const { title, priority } = props.data;

  return (
    <div className="Todo">
      <p>{title}</p>
      <p>Priority {priority}</p>
    </div>
  );
}

export default Todo;
