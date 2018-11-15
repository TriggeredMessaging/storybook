"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _buildStatic = require("./build-static");

var _buildDev = require("./build-dev");

async function build(options = {}, frameworkOptions = {}) {
  const {
    mode = 'dev'
  } = options;
  const commonOptions = { ...options,
    ...frameworkOptions,
    frameworkPresets: [...(options.frameworkPresets || []), ...(frameworkOptions.frameworkPresets || [])]
  };

  if (mode === 'dev') {
    return (0, _buildDev.buildDevStandalone)(commonOptions);
  }

  if (mode === 'static') {
    return (0, _buildStatic.buildStaticStandalone)(commonOptions);
  }

  throw new Error(`'mode' parameter should be either 'dev' or 'static'`);
}

var _default = build;
exports.default = _default;