"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildStaticStandalone = buildStaticStandalone;
exports.buildStatic = buildStatic;

var _webpack = _interopRequireDefault(require("webpack"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _nodeLogger = require("@storybook/node-logger");

var _cli = require("./cli");

var _config = _interopRequireDefault(require("./config"));

const defaultFavIcon = require.resolve('./public/favicon.ico');

async function buildStaticStandalone(options) {
  const {
    outputDir,
    staticDir,
    watch
  } = options; // create output directory if not exists

  _shelljs.default.mkdir('-p', _path.default.resolve(outputDir)); // clear the static dir


  _shelljs.default.rm('-rf', _path.default.resolve(outputDir, 'static'));

  _shelljs.default.cp(defaultFavIcon, outputDir); // Build the webpack configuration using the `baseConfig`
  // custom `.babelrc` file and `webpack.config.js` files
  // NOTE changes to env should be done before calling `getBaseConfig`


  const config = await (0, _config.default)({
    configType: 'PRODUCTION',
    corePresets: [require.resolve('./core-preset-prod.js')],
    ...options
  });
  config.output.path = _path.default.resolve(outputDir); // copy all static files

  if (staticDir) {
    staticDir.forEach(dir => {
      if (!_fs.default.existsSync(dir)) {
        _nodeLogger.logger.error(`Error: no such directory to load static files: ${dir}`);

        process.exit(-1);
      }

      _nodeLogger.logger.info(`=> Copying static files from: ${dir}`);

      _shelljs.default.cp('-r', `${dir}/*`, outputDir);
    });
  } // compile all resources with webpack and write them to the disk.


  return new Promise((resolve, reject) => {
    const webpackCb = (err, stats) => {
      if (err || stats.hasErrors()) {
        _nodeLogger.logger.error('Failed to build the storybook'); // eslint-disable-next-line no-unused-expressions


        err && _nodeLogger.logger.error(err.message); // eslint-disable-next-line no-unused-expressions

        stats && stats.hasErrors() && stats.toJson().errors.forEach(e => _nodeLogger.logger.error(e));
        process.exitCode = 1;
        return reject(err);
      }

      _nodeLogger.logger.info('Building storybook completed.');

      return resolve(stats);
    };

    _nodeLogger.logger.info('Building storybook ...');

    const compiler = (0, _webpack.default)(config);

    if (watch) {
      compiler.watch({}, webpackCb);
    } else {
      compiler.run(webpackCb);
    }
  });
}

async function buildStatic({
  packageJson,
  ...loadOptions
}) {
  const cliOptions = (0, _cli.getProdCli)(packageJson);
  await buildStaticStandalone({ ...cliOptions,
    ...loadOptions,
    configDir: cliOptions.configDir || './.storybook',
    outputDir: cliOptions.outputDir || './storybook-static'
  });
}