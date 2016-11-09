require('env2')('.env');

const Promise = require('bluebird');

const read = require('./lib/read-yaml');
const check = require('./lib/check-versions');
const fork = require('./lib/fork-repo');
const commit = require('./lib/make-commit');
const pr = require('./lib/pull-request');

function lambda (event, context, callback) {
  const versions = event.versions || [4, 5, 6, 7];
  const repo = event.repo;

  return Promise.resolve()
    .then(() => {
      return read(repo);
    })
    .then((yaml) => {
      return Promise.resolve()
        .then(() => {
          return check(versions, yaml.node_js);
        })
        .then((hasVersions) => {
          if (!hasVersions) {
            return fork(repo)
              .then((forkedRepo) => {
                return commit(forkedRepo, yaml, versions);
              })
              .then((commit) => {
                return pr(repo, commit.ref);
              });
          }
        });
    })
    .then(() => callback())
    .catch(callback);
}

module.exports = lambda;
