const Promise = require('bluebird');

function check (expected, actual) {
  return Promise.resolve()
    .then(() => {
      if (!actual) { return true; }
      actual = actual.map(v => v.toString());
      return expected.reduce((good, version) => {
        return good && (actual.indexOf(version) > -1 || actual.indexOf(version.toString()) > -1);
      }, true);
    });
}

module.exports = check;
