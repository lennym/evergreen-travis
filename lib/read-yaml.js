const https = require('https');
const bl = require('bl');
const yaml = require('js-yaml');

function read (repo) {
  const url = `https://raw.githubusercontent.com/${repo}/master/.travis.yml`;
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300) {
        return reject(new Error('NO_TRAVIS_YML'));
      }
      response.pipe(bl((err, data) => {
        if (err) {
          return reject(err);
        }
        const config = yaml.load(data.toString());
        if (config.language !== 'node_js') {
          reject(new Error(`Repository is not a node repository: ${config.language}`));
        }
        resolve(config);
      }));
    }).on('error', reject);
  });
}

module.exports = read;
