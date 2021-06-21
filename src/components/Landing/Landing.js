import GitHubIcon from '@material-ui/icons/GitHub';
import GroupIcon from '@material-ui/icons/Group';
import AddIcon from '@material-ui/icons/Add';
import { getIcon } from '../Page/Channels/Channels.js';

import firebase from 'firebase/app';

import logo from '../../img/logo.png';
import './Landing.css';

function Landing() {
  return (
    <div className="Landing">
      <div className="center-box">
        <img src={logo} alt="logo" />
        <h1>Devcomms</h1>
        <i>Team communication and coordination all in one place.</i>
        <hr />
        <div className="description">
          <b>Devcomms is an open source, developer-focused team communication and coordination tool aiming to simplify and streamline development.</b>
          <div className="line-margin flex-align icon-list">
            <GroupIcon />
            {getIcon('text')}
            {getIcon('sketch')}
            {getIcon('audio')}
            {getIcon('video')}
            {getIcon('notes')}
            {getIcon('todos')}
            {getIcon('goals')}
            <AddIcon />
          </div>
          Instead of having one tool for chatting and calling, one tool for arranging notes, and one tool for setting goals and to-dos, you can do all of that and more with Devcomms. No longer will you have to struggle to coordinate across several apps.<br />
        </div>
        <hr />
        <div>
          Devcomms is <b>100% open source.</b>
          <div className="line-margin">
            Have an issue? Want to contribute? Find our GitHub here:
          </div>
          <div className="flex-align">
            <GitHubIcon className="github-icon" />
            <a
              href="https://github.com/csaye/devcomms"
              target="_blank"
              rel="noreferrer noopener"
            >
              Devcomms GitHub
            </a>
          </div>
        </div>
        <hr />
        <div className="links">
          {
            firebase.auth().currentUser ?
            <a href="/home">Open Devcomms</a> :
            <>
              <a href="/signin">Sign in</a>
              <a href="/signup">Sign up</a>
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default Landing;
