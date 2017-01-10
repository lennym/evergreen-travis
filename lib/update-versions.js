function update (existing, versions, aliases) {
  existing = existing.map(v => v.toString());
  const aliased = existing.map(v => aliases[v] ? aliases[v].toString() : v);
  const unaliased = existing.filter(v => !aliases[v]).map(v => parseFloat(v)).filter(v => !isNaN(v));
  const newest = Math.max.apply(Math, unaliased);

  versions.forEach(v => {
    if (aliased.indexOf(v.toString()) === -1 && parseFloat(v) > newest) {
      existing.push(v.toString());
    }
  });

  return existing.sort(sortFunction(aliases));
}

function sortFunction (aliases) {
  return (a, b) => {
    const numa = parseFloat(aliases[a] ? aliases[a] : a);
    const numb = parseFloat(aliases[b] ? aliases[b] : b);

    if (!isNaN(numa) && !isNaN(numb)) {
      return numa - numb;
    } else if (isNaN(numa) && isNaN(numb)) {
      return b < a ? 1 : -1;
    } else {
      return isNaN(numb) ? -1 : 1;
    }
  };
}

module.exports = update;
