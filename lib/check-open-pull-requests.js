const GitHub = require('github');

function getPullRequests (repo) {
  const github = new GitHub();
  return new Promise((resolve, reject) => {
    github.authenticate({ type: 'token', token: process.env.GITHUB_ACCESS_TOKEN });
    github.pullRequests.getAll({
      owner: repo.split('/')[0],
      repo: repo.split('/')[1],
      state: 'open'
    }, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
}

function check (repo) {
  return getPullRequests(repo)
    .then((prs) => {
      return prs.filter((pr) => pr.user.login === process.env.GITHUB_USERNAME).length > 0;
    });
}

module.exports = check;
