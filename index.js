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
      console.log('Got yaml', repo);
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
          console.log('Checked versions', repo);
          return checkOpenPRs(repo)
            .then((hasOpenPR) => {
              if (hasOpenPR) {
                console.log(`Repo ${repo} already has an open PR`);
                throw new Error('OPEN_PR');
              }
            });
        })
        .then(() => {
          console.log('Checked open PR', repo);
          return fork(repo);
        })
        .then((forkedRepo) => {
          console.log('Forked', repo);
          return commit(forkedRepo, yaml, versions, aliases);
        })
        .then((commit) => {
          console.log('Commited', repo);
          return pr(repo, commit.ref);
        })
        .then(() => {
          console.log('Opened PR', repo);
        });
    })
    .catch((e) => {
      console.log('ERROR>>>', e.message);
      const nonFatal = ['NOT_NODE', 'NO_TRAVIS_YML', 'OPEN_PR', 'VERSION_MATCH'];
      if (nonFatal.indexOf(e.message) === -1) {
        throw e;
      }
    })
    .then(() => {
      callback();
    })
    .catch(callback);
}

module.exports = lambda;
