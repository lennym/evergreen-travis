const GitHub = require('github');

function fork (url) {
  const user = url.split('/')[0];
  const repo = url.split('/')[1];
  const github = new GitHub({});
  github.authenticate({ type: 'token', token: process.env.GITHUB_ACCESS_TOKEN });
  return new Promise((resolve, reject) => {
    github.repos.fork({ owner: user, repo: repo }, (err, response) => {
      err ? reject(err) : resolve(response);
    });
  });
}

module.exports = fork;
