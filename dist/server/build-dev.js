"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildDevStandalone = buildDevStandalone;
exports.buildDev = buildDev;

var _express = _interopRequireDefault(require("express"));

var _https = _interopRequireDefault(require("https"));

var _ip = _interopRequireDefault(require("ip"));

var _serveFavicon = _interopRequireDefault(require("serve-favicon"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _chalk = _interopRequireDefault(require("chalk"));

var _nodeLogger = require("@storybook/node-logger");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _fileSystemCache = _interopRequireDefault(require("file-system-cache"));

var _opn = _interopRequireDefault(require("opn"));

var _boxen = _interopRequireDefault(require("boxen"));

var _semver = _interopRequireDefault(require("semver"));

var _commonTags = require("common-tags");

var _cliTable = _interopRequireDefault(require("cli-table3"));

var _middleware = _interopRequireWildcard(require("./middleware"));

var _cli = require("./cli");

const defaultFavIcon = require.resolve('./public/favicon.ico');

const cache = (0, _fileSystemCache.default)({
  ns: 'storybook' // Optional. A grouping namespace for items.

});

function getServer(app, options) {
  if (!options.https) {
    return app;
  }

  if (!options.sslCert) {
    _nodeLogger.logger.error('Error: --ssl-cert is required with --https');

    process.exit(-1);
  }

  if (!options.sslKey) {
    _nodeLogger.logger.error('Error: --ssl-key is required with --https');

    process.exit(-1);
  }

  const sslOptions = {
    ca: (options.sslCa || []).map(ca => _fs.default.readFileSync(ca, 'utf-8')),
    cert: _fs.default.readFileSync(options.sslCert, 'utf-8'),
    key: _fs.default.readFileSync(options.sslKey, 'utf-8')
  };
  return _https.default.createServer(sslOptions, app);
}

function applyStatic(app, options) {
  const {
    staticDir
  } = options;
  let hasCustomFavicon = false;

  if (staticDir) {
    staticDir.forEach(dir => {
      const staticPath = _path.default.resolve(dir);

      if (!_fs.default.existsSync(staticPath)) {
        _nodeLogger.logger.error(`Error: no such directory to load static files: ${staticPath}`);

        process.exit(-1);
      }

      _nodeLogger.logger.info(`=> Loading static files from: ${staticPath} .`);

      app.use(_express.default.static(staticPath, {
        index: false
      }));

      const faviconPath = _path.default.resolve(staticPath, 'favicon.ico');

      if (_fs.default.existsSync(faviconPath)) {
        hasCustomFavicon = true;
        app.use((0, _serveFavicon.default)(faviconPath));
      }
    });
  }

  if (!hasCustomFavicon) {
    app.use((0, _serveFavicon.default)(defaultFavIcon));
  }
}

const updateCheck = async version => {
  let result;
  const time = Date.now();

  try {
    const fromCache = await cache.get('lastUpdateCheck', {
      success: false,
      time: 0
    }); // if last check was more then 24h ago

    if (time - 86400000 > fromCache.time) {
      const fromFetch = await Promise.race([(0, _nodeFetch.default)(`https://storybook.js.org/versions.json?current=${version}`), // if fetch is too slow, we won't wait for it
      new Promise((res, rej) => global.setTimeout(rej, 1500))]);
      const data = await fromFetch.json();
      result = {
        success: true,
        data,
        time
      };
      await cache.set('lastUpdateCheck', result);
    } else {
      result = fromCache;
    }
  } catch (error) {
    result = {
      success: false,
      error,
      time
    };
  }

  return result;
};

function listenToServer(server, listenAddr) {
  let serverResolve = () => {};

  let serverReject = () => {};

  const serverListening = new Promise((resolve, reject) => {
    serverResolve = resolve;
    serverReject = reject;
  });
  server.listen(...listenAddr, error => {
    if (error) {
      serverReject(error);
    } else {
      serverResolve();
    }
  });
  return serverListening;
}

async function buildDevStandalone(options) {
  try {
    const {
      port,
      host
    } = options; // Used with `app.listen` below

    const listenAddr = [port];

    if (host) {
      listenAddr.push(host);
    }

    const app = (0, _express.default)();
    const server = getServer(app, options);
    applyStatic(app, options);
    const storybookMiddleware = await (0, _middleware.default)(options);
    app.use(storybookMiddleware);
    const serverListening = listenToServer(server, listenAddr);
    const [stats, updateInfo] = await Promise.all([_middleware.webpackValid, updateCheck(options.packageJson.version), serverListening]);
    const proto = options.https ? 'https' : 'http';
    const address = `${proto}://${options.host || 'localhost'}:${port}/`;
    const networkAddress = `${proto}://${_ip.default.address()}:${port}/`;
    let updateMessage;

    try {
      updateMessage = updateInfo.success && _semver.default.lt(options.packageJson.version, updateInfo.data.latest.version) ? _commonTags.stripIndents`
          ${_chalk.default.hex('#F3AD38')(`A new version (${_chalk.default.bold(updateInfo.data.latest.version)}) is available!`)}
          ${_chalk.default.gray(updateInfo.data.latest.info.plain)}

          ${_chalk.default.gray('Read full changelog here:')}
          ${_chalk.default.gray.underline('https://git.io/fxc61')}
        ` : '';
    } catch (e) {
      updateMessage = '';
    }

    const serveMessage = new _cliTable.default({
      chars: {
        top: '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        bottom: '',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        left: '',
        'left-mid': '',
        mid: '',
        'mid-mid': '',
        right: '',
        'right-mid': '',
        middle: ''
      },
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0
    });
    serveMessage.push(['Local:', _chalk.default.cyan(address)], ['On your network:', _chalk.default.cyan(networkAddress)]); // eslint-disable-next-line no-console

    console.log((0, _boxen.default)(_commonTags.stripIndents`
          ${_chalk.default.hex('#A2E05E')(`Storybook ${_chalk.default.bold(options.packageJson.version)} started`)}

          ${serveMessage.toString()}${updateMessage ? `\n\n${updateMessage}` : ''}
        `, {
      borderStyle: 'round',
      padding: 1,
      borderColor: '#F1618C'
    }));

    if (options.smokeTest) {
      process.exit(stats.toJson().warnings.length ? 1 : 0);
    } else if (!options.ci) {
      (0, _opn.default)(address).catch(() => {
        _nodeLogger.logger.error(_commonTags.stripIndents`
          Could not open ${address} inside a browser. If you're running this command inside a
          docker container or on a CI, you need to pass the '--ci' flag to prevent opening a
          browser by default.
        `);
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      _nodeLogger.logger.error(error);
    }

    if (options.smokeTest) {
      process.exit(1);
    }
  }
}

async function buildDev({
  packageJson,
  ...loadOptions
}) {
  const cliOptions = await (0, _cli.getDevCli)(packageJson);
  await buildDevStandalone({ ...cliOptions,
    ...loadOptions,
    packageJson,
    configDir: cliOptions.configDir || './.storybook'
  });
}