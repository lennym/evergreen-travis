module.exports = function update(existing, versions, aliases) {
  existing = existing.map(v => v.toString());
  const aliased = existing.map(v => aliases[v] ? aliases[v].toString() : v);
  const newest = Math.max.apply(Math, aliased.map(v => parseFloat(v)));

  versions.forEach(v => {
    if (aliased.indexOf(v.toString()) === -1 && parseFloat(v) > newest) {
      existing.push(v.toString());
    }
  });

  return existing;
}