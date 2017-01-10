const Promise = require('bluebird');

const update = require('./update-versions');

function check (expected, actual, aliases) {
  aliases = aliases || {};
  return Promise.resolve()
    .then(() => {
      if (!actual) { return true; }
      const updated = update(actual, expected, aliases);
      return updated.length === actual.length;
    });
}

module.exports = check;
