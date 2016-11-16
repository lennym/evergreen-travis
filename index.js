require('env2')('.env');

const Promise = require('bluebird');

const read = require('./lib/read-yaml');
const checkVersions = require('./lib/check-versions');
const checkOpenPRs = require('./lib/check-open-pull-requests');
const fork = require('./lib/fork-repo');
const commit = require('./lib/make-commit');
const pr = require('./lib/pull-request');

function lambda (event, context, callback) {
  const versions = event.versions || [4, 5, 6, 7];
  const repo = event.repo;

  console.log('Received event', repo);

  return Promise.resolve()
    .then(() => {
      return read(repo);
    })
    .then((yaml) => {
      return Promise.resolve()
        .then(() => {
          return checkVersions(versions, yaml.node_js)
            .then((hasVersions) => {
              if (hasVersions) {
                console.log(`Repo ${repo} already contains versions: ${versions.join()}`);
                throw new Error('VERSION_MATCH');
              }
            });
        })
        .then(() => {
          return checkOpenPRs(repo)
            .then((hasOpenPR) => {
              if (hasOpenPR) {
                console.log(`Repo ${repo} already has an open PR`);
                throw new Error('OPEN_PR');
              }
            });
        })
        .then(() => {
          return fork(repo)
        })
        .then((forkedRepo) => {
          return commit(forkedRepo, yaml, versions);
        })
        .then((commit) => {
          return pr(repo, commit.ref);
        });
    })
    .catch((e) => {
      if (e.message !== 'OPEN_PR' && e.message !== 'VERSION_MATCH') {
        throw e;
      }
    })
    .then(() => callback())
    .catch(callback);
}

module.exports = lambda;
