/* eslint-env node, mocha */

const versions = require('../lib/check-versions');
const assert = require('assert');

describe('version matcher', () => {

  it('resolves true if all versions are present', () => {
    const expected = [4, 5, 6, 7];
    const actual = [4, 5, 6, 7];
    return versions(expected, actual, {})
      .then(val => assert.equal(val, true));
  });

  it('resolves false if all versions are present', () => {
    const expected = [4, 5, 6, 7];
    const actual = [4, 5, 7];
    return versions(expected, actual, {})
      .then(val => assert.equal(val, false));
  });

  it('applies aliases to configured versions', () => {
    const expected = [4, 5, 6, 7];
    const actual = ['lts/argon', 5, 'lts/boron', 7];
    const aliases = {
      'lts/argon': 4,
      'lts/boron': 6
    };
    return versions(expected, actual, aliases)
      .then(val => assert.equal(val, true));
  });

});
