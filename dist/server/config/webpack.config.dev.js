"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _webpack = _interopRequireDefault(require("webpack"));

var _dotenvWebpack = _interopRequireDefault(require("dotenv-webpack"));

var _WatchMissingNodeModulesPlugin = _interopRequireDefault(require("react-dev-utils/WatchMissingNodeModulesPlugin"));

var _caseSensitivePathsWebpackPlugin = _interopRequireDefault(require("case-sensitive-paths-webpack-plugin"));

var _htmlWebpackPlugin = _interopRequireDefault(require("html-webpack-plugin"));

var _utils = require("./utils");

var _utils2 = require("../utils");

var _package = require("../../../package.json");

var _default = ({
  configDir,
  quiet,
  babelOptions,
  entries
}) => {
  const environment = (0, _utils.loadEnv)();
  const entriesMeta = {
    iframe: {
      headHtmlSnippet: (0, _utils2.getPreviewHeadHtml)(configDir, process.env),
      bodyHtmlSnippet: (0, _utils2.getPreviewBodyHtml)()
    },
    manager: {
      headHtmlSnippet: (0, _utils2.getManagerHeadHtml)(configDir, process.env)
    }
  };
  return {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: entries,
    output: {
      path: _path.default.join(__dirname, 'dist'),
      filename: 'static/[name].bundle.js',
      // Here we set the publicPath to ''.
      // This allows us to deploy storybook into subpaths like GitHub pages.
      // This works with css and image loaders too.
      // This is working for storybook since, we don't use pushState urls and
      // relative URLs works always.
      publicPath: ''
    },
    plugins: [...Object.keys(entries).map(e => new _htmlWebpackPlugin.default({
      filename: `${e === 'manager' ? 'index' : e}.html`,
      excludeChunks: Object.keys(entries).filter(i => i !== e),
      chunksSortMode: 'none',
      alwaysWriteToDisk: true,
      inject: false,
      templateParameters: (compilation, files, options) => ({
        compilation,
        files,
        options,
        version: _package.version,
        ...entriesMeta[e]
      }),
      template: require.resolve(`../templates/index.ejs`)
    })), new _webpack.default.DefinePlugin(environment), new _webpack.default.HotModuleReplacementPlugin(), new _caseSensitivePathsWebpackPlugin.default(), new _WatchMissingNodeModulesPlugin.default(_utils.nodeModulesPaths), quiet ? null : new _webpack.default.ProgressPlugin(), new _dotenvWebpack.default({
      silent: true
    })].filter(Boolean),
    module: {
      rules: [{
        test: /\.(mjs|jsx?)$/,
        use: [{
          loader: 'babel-loader',
          options: babelOptions
        }],
        include: _utils.includePaths,
        exclude: _utils.excludePaths
      }, {
        test: /\.md$/,
        use: [{
          loader: require.resolve('raw-loader')
        }]
      }]
    },
    resolve: {
      // Since we ship with json-loader always, it's better to move extensions to here
      // from the default config.
      extensions: ['.mjs', '.js', '.jsx', '.json'],
      // Add support to NODE_PATH. With this we could avoid relative path imports.
      // Based on this CRA feature: https://github.com/facebookincubator/create-react-app/issues/253
      modules: ['node_modules'].concat(_utils.nodePaths),
      alias: {
        '@babel/runtime': (0, _utils.getBabelRuntimePath)()
      }
    },
    performance: {
      hints: false
    }
  };
};

exports.default = _default;