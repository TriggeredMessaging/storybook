"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _client_api = _interopRequireDefault(require("./client_api"));

/* eslint no-underscore-dangle: 0 */
describe('preview.client_api', function () {
  describe('setAddon', function () {
    it('should register addons', function () {
      var api = new _client_api.default({});
      var data;
      api.setAddon({
        aa: function aa() {
          data = 'foo';
        }
      });
      api.storiesOf('none', module).aa();
      expect(data).toBe('foo');
    });
    it('should not remove previous addons', function () {
      var api = new _client_api.default({});
      var data = [];
      api.setAddon({
        aa: function aa() {
          data.push('foo');
        }
      });
      api.setAddon({
        bb: function bb() {
          data.push('bar');
        }
      });
      api.storiesOf('none', module).aa().bb();
      expect(data).toEqual(['foo', 'bar']);
    });
    it('should call with the api context', function () {
      var api = new _client_api.default({});
      var data;
      api.setAddon({
        aa: function aa() {
          data = (0, _typeof2.default)(this.add);
        }
      });
      api.storiesOf('none', module).aa();
      expect(data).toBe('function');
    });
    it('should be able to access addons added previously', function () {
      var api = new _client_api.default({});
      var data;
      api.setAddon({
        aa: function aa() {
          data = 'foo';
        }
      });
      api.setAddon({
        bb: function bb() {
          this.aa();
        }
      });
      api.storiesOf('none', module).bb();
      expect(data).toBe('foo');
    });
    it('should be able to access the current kind', function () {
      var api = new _client_api.default({});
      var kind = 'dfdwf3e3';
      var data;
      api.setAddon({
        aa: function aa() {
          data = this.kind;
        }
      });
      api.storiesOf(kind, module).aa();
      expect(data).toBe(kind);
    });
  });
  describe('addDecorator', function () {
    var MockStoryStore =
    /*#__PURE__*/
    function () {
      function MockStoryStore() {
        (0, _classCallCheck2.default)(this, MockStoryStore);
        (0, _defineProperty2.default)(this, "stories", []);
      }

      (0, _createClass2.default)(MockStoryStore, [{
        key: "addStory",
        value: function addStory(kind, name, fn, fileName) {
          this.stories.push({
            kind: kind,
            name: name,
            fn: fn,
            fileName: fileName
          });
        }
      }, {
        key: "hasStory",
        value: function hasStory(k, n) {
          return this.stories.find(function (_ref) {
            var kind = _ref.kind,
                name = _ref.name;
            return kind === k && name === n;
          });
        }
      }]);
      return MockStoryStore;
    }();

    it('should add local decorators', function () {
      var storyStore = new MockStoryStore();
      var api = new _client_api.default({
        storyStore: storyStore
      });
      var localApi = api.storiesOf('none', module);
      localApi.addDecorator(function (fn) {
        return "aa-".concat(fn());
      });
      localApi.add('storyName', function () {
        return 'Hello';
      });
      expect(storyStore.stories[0].fn()).toBe('aa-Hello');
    });
    it('should add global decorators', function () {
      var storyStore = new MockStoryStore();
      var api = new _client_api.default({
        storyStore: storyStore
      });
      api.addDecorator(function (fn) {
        return "bb-".concat(fn());
      });
      var localApi = api.storiesOf('none', module);
      localApi.add('storyName', function () {
        return 'Hello';
      });
      expect(storyStore.stories[0].fn()).toBe('bb-Hello');
    });
    it('should utilize both decorators at once', function () {
      var storyStore = new MockStoryStore();
      var api = new _client_api.default({
        storyStore: storyStore
      });
      var localApi = api.storiesOf('none', module);
      api.addDecorator(function (fn) {
        return "aa-".concat(fn());
      });
      localApi.addDecorator(function (fn) {
        return "bb-".concat(fn());
      });
      localApi.add('storyName', function () {
        return 'Hello';
      });
      expect(storyStore.stories[0].fn()).toBe('aa-bb-Hello');
    });
    it('should pass the context', function () {
      var storyStore = new MockStoryStore();
      var api = new _client_api.default({
        storyStore: storyStore
      });
      var localApi = api.storiesOf('none', module);
      localApi.addDecorator(function (fn) {
        return "aa-".concat(fn());
      });
      localApi.add('storyName', function (_ref2) {
        var kind = _ref2.kind,
            story = _ref2.story;
        return "".concat(kind, "-").concat(story);
      });
      var kind = 'dfdfd';
      var story = 'ef349ff';
      var result = storyStore.stories[0].fn({
        kind: kind,
        story: story
      });
      expect(result).toBe("aa-".concat(kind, "-").concat(story));
    });
    it('should have access to the context', function () {
      var storyStore = new MockStoryStore();
      var api = new _client_api.default({
        storyStore: storyStore
      });
      var localApi = api.storiesOf('none', module);
      localApi.addDecorator(function (fn, _ref3) {
        var kind = _ref3.kind,
            story = _ref3.story;
        return "".concat(kind, "-").concat(story, "-").concat(fn());
      });
      localApi.add('storyName', function () {
        return 'Hello';
      });
      var kind = 'dfdfd';
      var story = 'ef349ff';
      var result = storyStore.stories[0].fn({
        kind: kind,
        story: story
      });
      expect(result).toBe("".concat(kind, "-").concat(story, "-Hello"));
    });
  });
  describe('clearDecorators', function () {
    it('should remove all global decorators', function () {
      var api = new _client_api.default({});
      api._globalDecorators = 1234;
      api.clearDecorators();
      expect(api._globalDecorators).toEqual([]);
    });
  });
  describe('getStorybook', function () {
    it('should transform the storybook to an Object', function () {
      var MockStoryStore =
      /*#__PURE__*/
      function () {
        function MockStoryStore() {
          (0, _classCallCheck2.default)(this, MockStoryStore);
        }

        (0, _createClass2.default)(MockStoryStore, [{
          key: "getStoryKinds",
          value: function getStoryKinds() {
            return ['kind-1', 'kind-2'];
          }
        }, {
          key: "getStoryFileName",
          value: function getStoryFileName(kind) {
            return "".concat(kind, ".js");
          }
        }, {
          key: "getStories",
          value: function getStories() {
            return ['a', 'b'];
          }
        }, {
          key: "getStoryAndParameters",
          value: function getStoryAndParameters() {
            return ['a', 'b'];
          }
        }, {
          key: "getStoryWithContext",
          value: function getStoryWithContext(kind, name) {
            return "".concat(kind, ":").concat(name);
          }
        }]);
        return MockStoryStore;
      }();

      var api = new _client_api.default({
        storyStore: new MockStoryStore()
      });
      var book = api.getStorybook();
      expect(book).toEqual([{
        kind: 'kind-1',
        fileName: 'kind-1.js',
        stories: [{
          name: 'a',
          render: 'kind-1:a'
        }, {
          name: 'b',
          render: 'kind-1:b'
        }]
      }, {
        kind: 'kind-2',
        fileName: 'kind-2.js',
        stories: [{
          name: 'a',
          render: 'kind-2:a'
        }, {
          name: 'b',
          render: 'kind-2:b'
        }]
      }]);
    });
    it('should pass paramaters', function () {
      var MockStoryStore =
      /*#__PURE__*/
      function () {
        function MockStoryStore() {
          (0, _classCallCheck2.default)(this, MockStoryStore);
        }

        (0, _createClass2.default)(MockStoryStore, [{
          key: "getStoryKinds",
          value: function getStoryKinds() {
            return ['kind-1', 'kind-2'];
          }
        }, {
          key: "getStoryFileName",
          value: function getStoryFileName(kind) {
            return "".concat(kind, ".js");
          }
        }, {
          key: "getStories",
          value: function getStories() {
            return ['a', 'b'];
          }
        }, {
          key: "getStoryAndParameters",
          value: function getStoryAndParameters() {
            return ['a', 'b'];
          }
        }, {
          key: "getStoryWithContext",
          value: function getStoryWithContext(kind, name) {
            return "".concat(kind, ":").concat(name);
          }
        }]);
        return MockStoryStore;
      }();

      var api = new _client_api.default({
        storyStore: new MockStoryStore()
      });
      var book = api.getStorybook({
        props: true
      });
      console.log(book);
      expect(book).toEqual([{
        kind: 'kind-1',
        fileName: 'kind-1.js',
        stories: [{
          name: 'a',
          render: 'kind-1:a'
        }, {
          name: 'b',
          render: 'kind-1:b'
        }]
      }, {
        kind: 'kind-2',
        fileName: 'kind-2.js',
        stories: [{
          name: 'a',
          render: 'kind-2:a'
        }, {
          name: 'b',
          render: 'kind-2:b'
        }]
      }]);
    });
  });
  describe('reads filename from module', function () {
    var api = new _client_api.default();
    var story = jest.fn();
    api.storiesOf('kind', {
      id: 'foo.js'
    }).add('story', story);
    var storybook = api.getStorybook();
    expect(storybook).toEqual([{
      kind: 'kind',
      fileName: 'foo.js',
      stories: [{
        name: 'story',
        render: expect.anything()
      }]
    }]);
    storybook[0].stories[0].render();
    expect(story).toHaveBeenCalled();
  });
  describe('reads filename from nodejs module', function () {
    var api = new _client_api.default();
    var story = jest.fn();
    api.storiesOf('kind', module).add('story', story);
    var storybook = api.getStorybook();
    expect(storybook).toEqual([{
      kind: 'kind',
      fileName: module.filename,
      stories: [{
        name: 'story',
        render: expect.anything()
      }]
    }]);
    storybook[0].stories[0].render();
    expect(story).toHaveBeenCalled();
  });
  describe('hot module loading', function () {
    var MockModule = function MockModule() {
      (0, _classCallCheck2.default)(this, MockModule);
      (0, _defineProperty2.default)(this, "hot", {
        callbacks: [],
        dispose: function dispose(fn) {
          this.callbacks.push(fn);
        },
        reload: function reload() {
          this.callbacks.forEach(function (fn) {
            return fn();
          });
        }
      });
    };

    it('should increment store revision when the module reloads', function () {
      var api = new _client_api.default();
      expect(api._storyStore.getRevision()).toEqual(0);
      var module = new MockModule();
      api.storiesOf('kind', module);
      module.hot.reload();
      expect(api._storyStore.getRevision()).toEqual(1);
    });
    it('should replace a kind when the module reloads', function () {
      var module = new MockModule();
      var stories = [jest.fn(), jest.fn()];
      var api = new _client_api.default();
      expect(api.getStorybook()).toEqual([]);
      api.storiesOf('kind', module).add('story', stories[0]);
      var firstStorybook = api.getStorybook();
      expect(firstStorybook).toEqual([{
        kind: 'kind',
        stories: [{
          name: 'story',
          render: expect.anything()
        }]
      }]);
      firstStorybook[0].stories[0].render();
      expect(stories[0]).toHaveBeenCalled();
      module.hot.reload();
      expect(api.getStorybook()).toEqual([]);
      api.storiesOf('kind', module).add('story', stories[1]);
      var secondStorybook = api.getStorybook();
      expect(secondStorybook).toEqual([{
        kind: 'kind',
        stories: [{
          name: 'story',
          render: expect.anything()
        }]
      }]);
      secondStorybook[0].stories[0].render();
      expect(stories[1]).toHaveBeenCalled();
    });
  });
  describe('parameters', function () {
    it('collects parameters across different modalities', function () {
      var storyStore = {
        addStory: jest.fn(),
        hasStory: function hasStory() {
          return false;
        }
      };
      var api = new _client_api.default({
        storyStore: storyStore
      });
      api.addParameters({
        a: 'global',
        b: 'global',
        c: 'global'
      });
      var kind = api.storiesOf('kind', module);
      kind.addParameters({
        b: 'kind',
        c: 'kind'
      });
      kind.add('story', jest.fn(), {
        c: 'story'
      });
      expect(storyStore.addStory).toHaveBeenCalledWith('kind', 'story', expect.any(Function), {
        a: 'global',
        b: 'kind',
        c: 'story',
        fileName: module.filename
      });
    });
    it('combines object parameters per-key', function () {
      var storyStore = {
        addStory: jest.fn(),
        hasStory: function hasStory() {
          return false;
        }
      };
      var api = new _client_api.default({
        storyStore: storyStore
      });
      api.addParameters({
        addon: {
          a: 'global',
          b: 'global',
          c: 'global',
          sub: {
            d: 'global'
          }
        }
      });
      var kind = api.storiesOf('kind', module);
      kind.addParameters({
        addon: {
          b: 'kind',
          c: 'kind',
          sub: {
            e: 'kind'
          }
        }
      });
      kind.add('story', jest.fn(), {
        addon: {
          c: 'story',
          sub: {
            f: 'story'
          }
        }
      });
      expect(storyStore.addStory).toHaveBeenCalledWith('kind', 'story', expect.any(Function), {
        addon: {
          a: 'global',
          b: 'kind',
          c: 'story',
          // Sub objects inside addons are *not* merged
          sub: {
            f: 'story'
          }
        },
        fileName: module.filename
      });
    });
  });
  describe('storiesOf', function () {
    describe('add', function () {
      it('should replace stories when adding the same story', function () {
        var stories = [jest.fn().mockReturnValue('story1'), jest.fn().mockReturnValue('story2')];
        var api = new _client_api.default();
        expect(api.getStorybook()).toEqual([]);
        api.storiesOf('kind', module).add('story', stories[0]);
        {
          var book = api.getStorybook();
          expect(book).toHaveLength(1);
          var entry = book[0];
          expect(entry.kind).toMatch('kind');
          expect(entry.stories).toHaveLength(1);
          expect(entry.stories[0].name).toBe('story'); // v3 returns the same function we passed in

          if (jest.isMockFunction(entry.stories[0].render)) {
            expect(entry.stories[0].render).toBe(stories[0]);
          } else {
            expect(entry.stories[0].render()).toBe('story1');
          }
        }
        var warn = jest.spyOn(global.console, 'warn').mockImplementationOnce(jest.fn());
        api.storiesOf('kind', module).add('story', stories[1]);
        expect(warn).toHaveBeenCalled();
        {
          var _book = api.getStorybook();

          expect(_book).toHaveLength(1);
          var _entry = _book[0];
          expect(_entry.kind).toMatch('kind');
          expect(_entry.stories).toHaveLength(1);
          expect(_entry.stories[0].name).toBe('story'); // v3 returns the same function we passed in

          if (jest.isMockFunction(_entry.stories[0].render)) {
            expect(_entry.stories[0].render).toBe(stories[0]);
          } else {
            expect(_entry.stories[0].render()).toBe('story2');
          }
        }
      });
    });
  });
});