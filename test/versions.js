/* eslint-env node, mocha */

const versions = require('../lib/check-versions');
const update = require('../lib/update-versions');
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
    const actual = [4, 5, 6];
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

  it('ignores missing versions which are older than other configured versions', () => {
    const expected = [4, 5, 6, 7];
    const actual = [4, 6, 7];
    return versions(expected, actual, {})
      .then(val => assert.equal(val, true));
  });

});

describe('version updater', () => {

  it('ignores missing versions which are older than other configured versions', () => {
    const updated = [4, 5, 6, 7];
    const existing = [4, 6, 7];
    assert.deepEqual(update(existing, updated, {}), ['4', '6', '7']);
  });

  it('preserves aliases in configured versions', () => {
    const updated = [4, 5, 6, 7];
    const existing = ['lts/argon', 5, 'lts/boron'];
    assert.deepEqual(update(existing, updated, { 'lts/argon': 4, 'lts/boron': 6 }), ['lts/argon', '5', 'lts/boron', '7']);
  });

});
