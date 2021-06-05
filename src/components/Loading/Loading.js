import './Loading.css';

function Loading(props) {
  return (
    <div className="Loading">
      <h1>{props.message}</h1>
    </div>
  );
}

export default Loading;
