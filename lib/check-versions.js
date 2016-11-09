function check (expected, actual) {
  return expected.reduce((good, version) => {
    return good && (actual.indexOf(version) > -1 || actual.indexOf(version.toString()) > -1);
  }, true);
}

module.exports = check;
