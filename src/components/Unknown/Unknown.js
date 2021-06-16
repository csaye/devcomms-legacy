import './Unknown.css';

function Unknown() {
  return (
    <div className="Unknown">
      <div className="center-box">
        <h1>404</h1>
        <p>Page Not Found</p>
        <button
          className="clean-btn"
          onClick={() => window.location.href = '/'}
        >
          Return to site
        </button>
      </div>
    </div>
  );
}

export default Unknown;
