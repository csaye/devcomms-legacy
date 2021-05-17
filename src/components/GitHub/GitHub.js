import React, { useEffect, useState } from 'react';

import Commit from '../Commit/Commit.js';

import GitHubIcon from '@material-ui/icons/GitHub';
import SearchIcon from '@material-ui/icons/Search';

import { githubToken } from '../../util/githubToken.js';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './GitHub.css';

function GitHub() {
  const [user, setUser] = useState('');
  const [repo, setRepo] = useState('');
  const [repoJson, setRepoJson] = useState(undefined);
  const [commitsJson, setCommitsJson] = useState(undefined);
  const [error, setError] = useState('');

  const repoRef = firebase.firestore().collection('repos').doc('repo');
  const [repoData] = useDocumentData(repoRef);

  // updates data for selected repository
  function updateRepo(e) {
    e.preventDefault();
    repoRef.update({
      user: user,
      repo: repo
    });
  }

  // gets data for current repository
  async function getRepoData() {

    // verify repo data and get url
    if (!repoData || !repoData.user || !repoData.repo) return;
    setUser(repoData.user);
    setRepo(repoData.repo);
    const repoName = `${repoData.user}/${repoData.repo}`;
    const url = `https://api.github.com/repos/${repoName}`;
    const options = {
      headers: {
        'Authorization': githubToken
      }
    };

    // get repo data
    await fetch(url, options).then(response => {
      if (response.ok) return response.json();
    }).then(json => {
      if (!json) {
        setError(repoName + ' is not a valid repository.');
        return;
      }
      setRepoJson(json);

      // get commit data
      fetch(`${url}/commits?per_page=10`, options).then(cResponse => {
        if (cResponse.ok) return cResponse.json();
      }).then(cJson => {
        if (!cJson) {
          setError(repoName + ' is not a valid repository.');
          return;
        }
        setCommitsJson(cJson);
      })
    });
  }

  useEffect(() => {
    // update data when repo data updates
    getRepoData();
  }, [repoData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="GitHub">
      <h1><GitHubIcon /> GitHub</h1>
      <form onSubmit={updateRepo}>
        github.com/
        <input
          placeholder="user"
          value={user}
          onChange={e => setUser(e.target.value)}
          required
        />
        /
        <input
          placeholder="repo"
          value={repo}
          onChange={e => setRepo(e.target.value)}
          required
        />
        <div>
          <button type="submit" className="search-button">
            <SearchIcon />
          </button>
        </div>
      </form>
      {
        error ?
        <p className="error-text">{error}</p> :
        <>
          {
            (repoJson && commitsJson) ?
            <>
              <div>
                <a href={repoJson.html_url} target="_blank" rel="noreferrer">
                  <h1>{repoJson.full_name}</h1>
                </a>
                <div className="repo-data">
                  <p>Last updated:<br />
                    {' '}{new Date(repoJson.updated_at).toDateString()},
                    {' '}{new Date(repoJson.updated_at).toLocaleTimeString()}
                  </p>
                  <p>Written in {repoJson.language}</p>
                </div>
              </div>
              <div>
                <a href={repoJson.html_url + '/commits'} target="_blank" rel="noreferrer">
                  <h1>commits</h1>
                </a>
                {
                  commitsJson.length > 0 ?
                  commitsJson.map((c, i) =>
                    <Commit key={`commit-${i}`} data={c} />
                  ) :
                  <p>No commits yet</p>
                }
              </div>
            </> :
            <p>Loading repo data...</p>
          }
        </>
      }
    </div>
  );
}

export default GitHub;
