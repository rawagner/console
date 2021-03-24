import * as fs from 'fs';
import * as readPkg from 'read-pkg';

const PKG_NAME = '@openshift-console/dynamic-plugin-sdk';
const PKG_MAIN = 'lib/console-dynamic-plugin-sdk/src/index.js';
const WEBPACK_PLUGIN_EXPORTS =
  './lib/console-dynamic-plugin-sdk/src/webpack/ConsoleRemotePlugin.js';

const createPackageJson = () => {
  const packageJson = readPkg.sync({ normalize: false });
  packageJson.name = PKG_NAME;
  delete packageJson.private;
  packageJson.license = 'Apache-2.0';
  packageJson.main = PKG_MAIN;
  packageJson.exports = {
    './': `./${PKG_MAIN}`,
    './webpack': WEBPACK_PLUGIN_EXPORTS,
  };
  packageJson.readme = './README.md';
  packageJson.peerDependencies = packageJson.dependencies;
  delete packageJson.dependencies;
  delete packageJson.devDependencies;
  delete packageJson.scripts;
  fs.writeFileSync(`dist/package.json`, JSON.stringify(packageJson, null, 2));
};

createPackageJson();
