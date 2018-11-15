"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _commander = _interopRequireDefault(require("commander"));

var _chalk = _interopRequireDefault(require("chalk"));

var _detectPort = _interopRequireDefault(require("detect-port"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _nodeLogger = require("@storybook/node-logger");

var _utils = require("./utils");

const getFreePort = port => (0, _detectPort.default)(port).catch(error => {
  _nodeLogger.logger.error(error);

  process.exit(-1);
});

async function getCLI(packageJson) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';

  _commander.default.version(packageJson.version).option('-p, --port [number]', 'Port to run Storybook', str => parseInt(str, 10)).option('-h, --host [string]', 'Host to run Storybook').option('-s, --static-dir <dir-names>', 'Directory where to load static files from', _utils.parseList).option('-c, --config-dir [dir-name]', 'Directory where to load Storybook configurations from').option('--https', 'Serve Storybook over HTTPS. Note: You must provide your own certificate information.').option('--ssl-ca <ca>', 'Provide an SSL certificate authority. (Optional with --https, required if using a self-signed certificate)', _utils.parseList).option('--ssl-cert <cert>', 'Provide an SSL certificate. (Required with --https)').option('--ssl-key <key>', 'Provide an SSL key. (Required with --https)').option('--smoke-test', 'Exit after successful start').option('--ci', "CI mode (skip interactive prompts, don't open browser").option('--quiet', 'Suppress verbose build output').parse(process.argv);

  _nodeLogger.logger.info(_chalk.default.bold(`${packageJson.name} v${packageJson.version}`) + _chalk.default.reset('\n')); // The key is the field created in `program` variable for
  // each command line argument. Value is the env variable.


  (0, _utils.getEnvConfig)(_commander.default, {
    port: 'SBCONFIG_PORT',
    host: 'SBCONFIG_HOSTNAME',
    staticDir: 'SBCONFIG_STATIC_DIR',
    configDir: 'SBCONFIG_CONFIG_DIR'
  });
  const port = await getFreePort(_commander.default.port);

  if (!_commander.default.ci && !_commander.default.smokeTest && _commander.default.port != null && port !== _commander.default.port) {
    const {
      shouldChangePort
    } = await _inquirer.default.prompt({
      type: 'confirm',
      default: true,
      name: 'shouldChangePort',
      message: `Port ${_commander.default.port} is not available.
Would you like to run Storybook on port ${port} instead?`
    });

    if (!shouldChangePort) {
      process.exit(1);
    }
  }

  return { ..._commander.default,
    port
  };
}

var _default = getCLI;
exports.default = _default;