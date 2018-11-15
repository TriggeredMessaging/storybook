"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _commander = _interopRequireDefault(require("commander"));

var _chalk = _interopRequireDefault(require("chalk"));

var _nodeLogger = require("@storybook/node-logger");

var _utils = require("./utils");

function getCLI(packageJson) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';

  _commander.default.version(packageJson.version).option('-s, --static-dir <dir-names>', 'Directory where to load static files from', _utils.parseList).option('-o, --output-dir [dir-name]', 'Directory where to store built files').option('-c, --config-dir [dir-name]', 'Directory where to load Storybook configurations from').option('-w, --watch', 'Enable watch mode').parse(process.argv);

  _nodeLogger.logger.info(_chalk.default.bold(`${packageJson.name} v${packageJson.version}\n`)); // The key is the field created in `program` variable for
  // each command line argument. Value is the env variable.


  (0, _utils.getEnvConfig)(_commander.default, {
    staticDir: 'SBCONFIG_STATIC_DIR',
    outputDir: 'SBCONFIG_OUTPUT_DIR',
    configDir: 'SBCONFIG_CONFIG_DIR'
  });
  return { ..._commander.default
  };
}

var _default = getCLI;
exports.default = _default;