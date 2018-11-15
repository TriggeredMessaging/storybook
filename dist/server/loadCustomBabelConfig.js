"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _json = _interopRequireDefault(require("json5"));

var _resolve = require("resolve");

var _semver = require("semver");

var _nodeLogger = require("@storybook/node-logger");

function removeReactHmre(presets) {
  const index = presets.indexOf('react-hmre');

  if (index > -1) {
    presets.splice(index, 1);
  }
} // Tries to load a .babelrc and returns the parsed object if successful


function loadFromPath(babelConfigPath) {
  let config;

  if (_fs.default.existsSync(babelConfigPath)) {
    const content = _fs.default.readFileSync(babelConfigPath, 'utf-8');

    try {
      config = _json.default.parse(content);
      config.babelrc = false;

      _nodeLogger.logger.info('=> Loading custom .babelrc');
    } catch (e) {
      _nodeLogger.logger.error(`=> Error parsing .babelrc file: ${e.message}`);

      throw e;
    }
  }

  if (!config) return null; // Remove react-hmre preset.
  // It causes issues with react-storybook.
  // We don't really need it.
  // Earlier, we fix this by running storybook in the production mode.
  // But, that hide some useful debug messages.

  if (config.presets) {
    removeReactHmre(config.presets);
  }

  if (config.env && config.env.development && config.env.development.presets) {
    removeReactHmre(config.env.development.presets);
  }

  return config;
}

function isBabelLoader8() {
  // eslint-disable-next-line import/no-dynamic-require,global-require
  const babelLoaderPkg = require((0, _resolve.sync)('babel-loader/package.json', {
    basedir: process.cwd()
  }));

  return (0, _semver.satisfies)(babelLoaderPkg.version, '>=8.0.0-0');
}

async function _default(configDir, getDefaultConfig) {
  const babelConfig = loadFromPath(_path.default.resolve(configDir, '.babelrc'));

  if (babelConfig) {
    // If the custom config uses babel's `extends` clause, then replace it with
    // an absolute path. `extends` will not work unless we do this.
    if (babelConfig.extends) {
      babelConfig.extends = _path.default.resolve(configDir, babelConfig.extends);
    }

    return babelConfig;
  }

  return isBabelLoader8() ? getDefaultConfig() : {};
}