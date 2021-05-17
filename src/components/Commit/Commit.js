import './Commit.css';

function Commit(props) {
  const { author, commit, html_url } = props.data;

  return (
    <div className="Commit">
      <p>
        <a href={author.html_url} target="_blank" rel="noreferrer">
          @{author.login}
        </a>
        {' - '}
        <a href={html_url} target="_blank" rel="noreferrer">
          {commit.message}
        </a>
        {' (' + new Date(commit.committer.date).toLocaleDateString() + ')'}
      </p>
    </div>
  );
}

export default Commit;
