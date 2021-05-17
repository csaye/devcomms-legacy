import React, { useEffect, useState } from 'react';

import GitHubIcon from '@material-ui/icons/GitHub';
import SearchIcon from '@material-ui/icons/Search';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

import './GitHub.css';

function GitHub() {
  const [user, setUser] = useState('');
  const [repo, setRepo] = useState('');
  const [repoJson, setRepoJson] = useState(undefined);
  const [commitsJson, setCommitsJson] = useState(undefined);

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
    const url = `https://api.github.com/repos/${repoData.user}/${repoData.repo}`;

    // get repo data
    await fetch(url).then(response => {
      if (response.ok) return response.json();
      else throw new Error('GitHub request failed!');
    }).then(json => {
      console.log(json);
      setRepoJson(json);

      // get commit data
      fetch(`${url}/commits?per_page=10`).then(cResponse => {
        if (cResponse.ok) return cResponse.json();
        else throw new Error('GitHub request failed!');
      }).then(cJson => {
        console.log(cJson);
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
        repoJson ?
        <div>
          <a href={repoJson.html_url} target="_blank" rel="noreferrer">
            <h1>{repoJson.full_name}</h1>
          </a>
          <p>Last updated:<br />
            {' '}{new Date(repoJson.updated_at).toDateString()},
            {' '}{new Date(repoJson.updated_at).toLocaleTimeString()}
          </p>
          <p>Written in {repoJson.language}</p>
        </div> :
        <p>Loading repo...</p>
      }
      {
        commitsJson ?
        <div>
          <a href={repoJson.html_url + '/commits'} target="_blank" rel="noreferrer">
            <h1>commits</h1>
          </a>
          {
            commitsJson.length > 0 ?
            commitsJson.map((c, i) =>
              <div key={`commit-${i}`}>
                <p>
                  <a href={c.author.html_url} target="_blank" rel="noreferrer">
                    @{c.author.login}
                  </a>
                  {' - '}
                  <a href={c.html_url} target="_blank" rel="noreferrer">
                    {c.commit.message}
                  </a>
                  {' (' + new Date(c.commit.committer.date).toLocaleDateString() + ')'}
                </p>
              </div>
            ) :
            <p>No commits yet</p>
          }
        </div> :
        <p>Loading commits...</p>
      }
    </div>
  );
}

export default GitHub;
