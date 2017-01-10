const yaml = require('js-yaml');
const GitHub = require('github');

function getHeadSHA (repo) {
  const params = {
    owner: repo.full_name.split('/')[0],
    repo: repo.full_name.split('/')[1],
    ref: `heads/${repo.default_branch}`
  };
  return performGitAction('getReference', params, { auth: false })
    .then((ref) => ref.object.sha);
}

function createBlob (repo, content) {
  const params = {
    owner: repo.full_name.split('/')[0],
    repo: repo.full_name.split('/')[1],
    content: content,
    encoding: 'utf-8'
  };
  return performGitAction('createBlob', params);
}

function createTree (repo, sha, content) {
  const params = {
    owner: repo.full_name.split('/')[0],
    repo: repo.full_name.split('/')[1],
    tree: [{
      path: '.travis.yml',
      mode: '100644',
      type: 'blob',
      sha: content
    }],
    base_tree: sha
  };
  return performGitAction('createTree', params);
}

function createCommit (repo, parent, tree) {
  const params = {
    owner: repo.full_name.split('/')[0],
    repo: repo.full_name.split('/')[1],
    tree: tree,
    parents: [ parent ],
    message: '[evergreen-travis] Update node versions in .travis.yml'
  };
  return performGitAction('createCommit', params);
}

function pushCommit (repo, commit) {
  const params = {
    owner: repo.full_name.split('/')[0],
    repo: repo.full_name.split('/')[1],
    ref: `refs/heads/evergreen-travis-${Date.now()}`,
    sha: commit
  };
  return performGitAction('createReference', params);
}

function performGitAction (action, params, options) {
  options = options || {};
  const github = new GitHub();
  return new Promise((resolve, reject) => {
    if (options.auth !== false) {
      github.authenticate({ type: 'token', token: process.env.GITHUB_ACCESS_TOKEN });
    }
    github.gitdata[action](params, (err, response) => {
      err ? reject(err) : resolve(response);
    });
  });

}

function commit (repo, config, versions, aliases) {
  const configured = config.node_js.map(v => v.toString());
  const aliased = configured.map(v => aliases[v] ? aliases[v].toString() : v);
  versions.forEach(v => {
    if (aliased.indexOf(v.toString()) === -1) {
      configured.push(v.toString());
    }
  });
  config.node_js = configured;
  const content = yaml.safeDump(config);
  return getHeadSHA(repo)
    .then((sha) => {
      return createBlob(repo, content)
        .then((blob) => {
          return createTree(repo, sha, blob.sha);
        })
        .then((tree) => {
          return createCommit(repo, sha, tree.sha);
        })
        .then((commit) => {
          return pushCommit(repo, commit.sha);
        });
    });
}

module.exports = commit;