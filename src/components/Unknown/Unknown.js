import logo from '../../img/logo.png';
import './Unknown.css';

function Unknown() {
  return (
    <div className="Unknown">
      <div className="center-box">
        <img src={logo} alt="logo" />
        <h1>404 Error</h1>
        <hr />
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
