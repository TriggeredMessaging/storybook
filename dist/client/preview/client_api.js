"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.defaultDecorateStory = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _clientLogger = require("@storybook/client-logger");

var _addons = _interopRequireDefault(require("@storybook/addons"));

var _coreEvents = _interopRequireDefault(require("@storybook/core-events"));

var _story_store = _interopRequireDefault(require("./story_store"));

var _subscriptions_store = _interopRequireDefault(require("./subscriptions_store"));

/* eslint no-underscore-dangle: 0 */
var defaultDecorateStory = function defaultDecorateStory(getStory, decorators) {
  return decorators.reduce(function (decorated, decorator) {
    return function (context) {
      return decorator(function () {
        return decorated(context);
      }, context);
    };
  }, getStory);
};

exports.defaultDecorateStory = defaultDecorateStory;

var metaSubscription = function metaSubscription() {
  _addons.default.getChannel().on(_coreEvents.default.REGISTER_SUBSCRIPTION, _subscriptions_store.default.register);

  return function () {
    return _addons.default.getChannel().removeListener(_coreEvents.default.REGISTER_SUBSCRIPTION, _subscriptions_store.default.register);
  };
};

var withSubscriptionTracking = function withSubscriptionTracking(storyFn) {
  if (!_addons.default.hasChannel()) return storyFn();

  _subscriptions_store.default.markAllAsUnused();

  _subscriptions_store.default.register(metaSubscription);

  var result = storyFn();

  _subscriptions_store.default.clearUnused();

  return result;
};

var ClientApi = function ClientApi() {
  var _this = this;

  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$storyStore = _ref.storyStore,
      storyStore = _ref$storyStore === void 0 ? new _story_store.default() : _ref$storyStore,
      _ref$decorateStory = _ref.decorateStory,
      decorateStory = _ref$decorateStory === void 0 ? defaultDecorateStory : _ref$decorateStory;

  (0, _classCallCheck2.default)(this, ClientApi);
  (0, _defineProperty2.default)(this, "setAddon", function (addon) {
    _this._addons = (0, _objectSpread2.default)({}, _this._addons, addon);
  });
  (0, _defineProperty2.default)(this, "addDecorator", function (decorator) {
    _this._globalDecorators.push(decorator);
  });
  (0, _defineProperty2.default)(this, "addParameters", function (parameters) {
    _this._globalParameters = parameters;
  });
  (0, _defineProperty2.default)(this, "clearDecorators", function () {
    _this._globalDecorators = [];
  });
  (0, _defineProperty2.default)(this, "storiesOf", function (kind, m) {
    if (!kind && typeof kind !== 'string') {
      throw new Error('Invalid or missing kind provided for stories, should be a string');
    }

    if (!m) {
      _clientLogger.logger.warn("Missing 'module' parameter for story with a kind of '".concat(kind, "'. It will break your HMR"));
    }

    if (m && m.hot && m.hot.dispose) {
      m.hot.dispose(function () {
        _this._storyStore.removeStoryKind(kind);

        _this._storyStore.incrementRevision();
      });
    }

    var localDecorators = [];
    var localParameters = {};
    var api = {
      kind: kind
    }; // apply addons

    Object.keys(_this._addons).forEach(function (name) {
      var addon = _this._addons[name];

      api[name] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        addon.apply(api, args);
        return api;
      };
    });

    api.add = function (storyName, getStory, parameters) {
      if (typeof storyName !== 'string') {
        throw new Error("Invalid or missing storyName provided for a \"".concat(kind, "\" story."));
      }

      if (_this._storyStore.hasStory(kind, storyName)) {
        _clientLogger.logger.warn("Story of \"".concat(kind, "\" named \"").concat(storyName, "\" already exists"));
      } // Wrap the getStory function with each decorator. The first
      // decorator will wrap the story function. The second will
      // wrap the first decorator and so on.


      var decorators = localDecorators.concat((0, _toConsumableArray2.default)(_this._globalDecorators), [withSubscriptionTracking]);
      var fileName = m ? m.id : null;
      var allParam = {
        fileName: fileName
      };
      [_this._globalParameters, localParameters, parameters].forEach(function (params) {
        if (params) {
          Object.keys(params).forEach(function (key) {
            if (Array.isArray(params[key])) {
              allParam[key] = params[key];
            } else if ((0, _typeof2.default)(params[key]) === 'object') {
              allParam[key] = (0, _objectSpread2.default)({}, allParam[key], params[key]);
            } else {
              allParam[key] = params[key];
            }
          });
        }
      }); // Add the fully decorated getStory function.

      _this._storyStore.addStory(kind, storyName, _this._decorateStory(getStory, decorators), allParam);

      return api;
    };

    api.addDecorator = function (decorator) {
      localDecorators.push(decorator);
      return api;
    };

    api.addParameters = function (parameters) {
      localParameters = (0, _objectSpread2.default)({}, localParameters, parameters);
      return api;
    };

    return api;
  });
  (0, _defineProperty2.default)(this, "getStorybook", function (params) {
    return _this._storyStore.getStoryKinds().map(function (kind) {
      var fileName = _this._storyStore.getStoryFileName(kind);

      var stories = _this._storyStore.getStories(kind).map(function (name) {
        var render = _this._storyStore.getStoryWithContext(kind, name);

        if (params) {
          var param = _this._storyStore.getStoryAndParameters(kind, name);

          return {
            name: name,
            render: render,
            parameters: param.parameters
          };
        }

        return {
          name: name,
          render: render
        };
      });

      return {
        kind: kind,
        fileName: fileName,
        stories: stories
      };
    });
  });
  this._storyStore = storyStore;
  this._addons = {};
  this._globalDecorators = [];
  this._globalParameters = {};
  this._decorateStory = decorateStory;
};

exports.default = ClientApi;