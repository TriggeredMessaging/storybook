"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isReactScriptsInstalled = isReactScriptsInstalled;
exports.getStyleRules = getStyleRules;
exports.getCraWebpackConfig = getCraWebpackConfig;
exports.applyCRAWebpackConfig = applyCRAWebpackConfig;

var _semver = _interopRequireDefault(require("semver"));

var _miniCssExtractPlugin = _interopRequireDefault(require("mini-css-extract-plugin"));

var _RuleSet = require("webpack/lib/RuleSet");

function isReactScriptsInstalled() {
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const reactScriptsJson = require('react-scripts/package.json');

    if (_semver.default.lt(reactScriptsJson.version, '2.0.0')) return false;
    return true;
  } catch (e) {
    return false;
  }
}

function getStyleRules(rules) {
  // Extensions of style rules we're interested in
  const extensions = ['.css', '.scss', '.sass', '.module.css', '.module.scss', '.module.sass'];
  return rules.reduce((styleRules, rule) => {
    // If at least one style extension satisfies the rule test, the rule is one
    // we want to extract
    if (rule.test && extensions.some((0, _RuleSet.normalizeCondition)(rule.test))) {
      // If the base test is for styles, return early
      return styleRules.concat(rule);
    } //  Get any style rules contained in rule.oneOf


    if (!rule.test && rule.oneOf) {
      styleRules.push(...getStyleRules(rule.oneOf));
    } // Get any style rules contained in rule.rules


    if (!rule.test && rule.rules) {
      styleRules.push(...getStyleRules(rule.rules));
    }

    return styleRules;
  }, []);
}

function getCraWebpackConfig(mode) {
  if (mode === 'production') {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    return require('react-scripts/config/webpack.config.prod');
  } // eslint-disable-next-line global-require, import/no-extraneous-dependencies


  return require('react-scripts/config/webpack.config.dev');
}

function applyCRAWebpackConfig(baseConfig) {
  // Remove any rules from baseConfig that test true for any one of the extensions
  const baseRulesExcludingStyles = baseConfig.module.rules.filter(rule => !rule.test || !['.css', '.scss', '.sass'].some((0, _RuleSet.normalizeCondition)(rule.test))); //  Load create-react-app config

  const craWebpackConfig = getCraWebpackConfig(baseConfig.mode);
  const craStyleRules = getStyleRules(craWebpackConfig.module.rules); //  Add css minification for production

  const plugins = [...baseConfig.plugins];

  if (baseConfig.mode === 'production') {
    plugins.push(new _miniCssExtractPlugin.default());
  }

  return { ...baseConfig,
    module: { ...baseConfig.module,
      rules: [...baseRulesExcludingStyles, ...craStyleRules]
    },
    plugins
  };
}