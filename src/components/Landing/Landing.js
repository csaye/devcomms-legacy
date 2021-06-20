import logo from '../../img/logo.png';
import './Landing.css';

function Landing() {
  return (
    <div className="Landing">
      <div className="center-box">
        <img src={logo} alt="logo" />
        <h1>Devcomms</h1>
        <hr />
      </div>
    </div>
  );
}

export default Landing;
