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
  const aliases = event.aliases || {};
  const repo = event.repo;

  console.log('Received event', repo);

  return Promise.resolve()
    .then(() => {
      return read(repo);
    })
    .then((yaml) => {
      return Promise.resolve()
        .then(() => {
          return checkVersions(versions, yaml.node_js, aliases)
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
          return fork(repo);
        })
        .then((forkedRepo) => {
          return commit(forkedRepo, yaml, versions, aliases);
        })
        .then((commit) => {
          return pr(repo, commit.ref);
        });
    })
    .catch((e) => {
      const nonFatal = ['NOT_NODE', 'NO_TRAVIS_YML', 'OPEN_PR', 'VERSION_MATCH'];
      if (nonFatal.indexOf(e.message) === -1) {
        throw e;
      }
    })
    .then(() => callback())
    .catch(callback);
}

module.exports = lambda;
