const GitHub = require('github');
const message = require('./pr-message');

function pr (repo, source) {
  const params = {
    owner: repo.split('/')[0],
    repo: repo.split('/')[1],
    title: '[evergreen-travis] Update .travis.yml node versions',
    body: message,
    head: `${process.env.GITHUB_USERNAME}:${source.split('/')[2]}`,
    base: 'master'
  };
  const github = new GitHub();
  return new Promise((resolve, reject) => {
    github.authenticate({ type: 'token', token: process.env.GITHUB_ACCESS_TOKEN });
    github.pullRequests.create(params, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
}

module.exports = pr;