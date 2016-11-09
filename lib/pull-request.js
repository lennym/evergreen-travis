const GitHub = require('github');

function pr (repo, source) {
  const github = new GitHub();
  return new Promise((resolve, reject) => {
    github.authenticate({ type: 'token', token: process.env.GITHUB_ACCESS_TOKEN });
    github.pullRequests.create({
      owner: repo.split('/')[0],
      repo: repo.split('/')[1],
      title: '[evergreen-travis] Update .travis.yml node versions',
      head: `evergreen-travis:${source.split('/')[2]}`,
      base: 'master'
    }, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
}

module.exports = pr;