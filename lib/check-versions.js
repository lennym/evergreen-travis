const Promise = require('bluebird');

function check (expected, actual, aliases) {
  aliases = aliases || {};
  return Promise.resolve()
    .then(() => {
      if (!actual) { return true; }
      actual = actual.map(v => v.toString());
      actual = actual.map(v => aliases[v] ? aliases[v].toString() : v);
      return expected.reduce((good, version) => {
        return good && (actual.indexOf(version.toString()) > -1);
      }, true);
    });
}

module.exports = check;
