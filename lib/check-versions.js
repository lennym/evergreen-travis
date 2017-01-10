const Promise = require('bluebird');

function check (expected, actual, aliases) {
  aliases = aliases || {};
  return Promise.resolve()
    .then(() => {
      if (!actual) { return true; }
      actual = actual.map(v => v.toString());
      actual = actual.map(v => aliases[v] ? aliases[v].toString() : v);
      const newest = Math.max.apply(Math, actual.map(v => parseFloat(v)));
      return expected.reduce((good, version) => {
        return good && (actual.indexOf(version.toString()) > -1 || parseInt(version) < newest);
      }, true);
    });
}

module.exports = check;
