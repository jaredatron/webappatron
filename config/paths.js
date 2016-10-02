const fs = require('fs')
const path = require('path')

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
var appRoot = fs.realpathSync(process.cwd());
var moduleRoot = fs.realpathSync(path.resolve(__dirname, '..'));

const appPath = function(relativePath) {
  return path.resolve(appRoot, relativePath);
}

const relativeAppPath = function(relativePath) {
  return path.relative(appRoot, appPath(relativePath));
}

const modulePath = function(relativePath) {
  return path.resolve(moduleRoot, relativePath);
}

module.exports = {
  appRoot,
  moduleRoot,
  appPath,
  relativeAppPath,
  modulePath,
}
