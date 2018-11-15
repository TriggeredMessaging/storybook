"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadEnv = loadEnv;
exports.getBabelRuntimePath = exports.nodePaths = exports.nodeModulesPaths = exports.excludePaths = exports.includePaths = void 0;

var _path = _interopRequireDefault(require("path"));

var _lazyUniversalDotenv = require("lazy-universal-dotenv");

const includePaths = [_path.default.resolve('./')];
exports.includePaths = includePaths;
const excludePaths = [_path.default.resolve('node_modules')];
exports.excludePaths = excludePaths;

const nodeModulesPaths = _path.default.resolve('./node_modules');

exports.nodeModulesPaths = nodeModulesPaths;
const nodePaths = (process.env.NODE_PATH || '').split(process.platform === 'win32' ? ';' : ':').filter(Boolean).map(p => _path.default.resolve('./', p)); // Load environment variables starts with STORYBOOK_ to the client side.

exports.nodePaths = nodePaths;

function loadEnv(options = {}) {
  const defaultNodeEnv = options.production ? 'production' : 'development';
  const env = {
    NODE_ENV: JSON.stringify(process.env.NODE_ENV || defaultNodeEnv),
    // This is to support CRA's public folder feature.
    // In production we set this to dot(.) to allow the browser to access these assests
    // even when deployed inside a subpath. (like in GitHub pages)
    // In development this is just empty as we always serves from the root.
    PUBLIC_URL: JSON.stringify(options.production ? '.' : '')
  };
  Object.keys(process.env).filter(name => /^STORYBOOK_/.test(name)).forEach(name => {
    env[name] = JSON.stringify(process.env[name]);
  });
  const {
    stringified
  } = (0, _lazyUniversalDotenv.getEnvironment)({
    nodeEnv: JSON.parse(env.NODE_ENV)
  });
  return {
    'process.env': Object.assign({}, env, stringified)
  };
}

const getBabelRuntimePath = () => {
  const pkgJsonPath = require.resolve('@babel/runtime/package.json');

  return _path.default.dirname(pkgJsonPath);
};

exports.getBabelRuntimePath = getBabelRuntimePath;