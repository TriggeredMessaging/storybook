"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _story_store = _interopRequireDefault(require("./story_store"));

describe('preview.story_store', function () {
  describe('dumpStoryBook', function () {
    it('should return nothing when empty', function () {
      var store = new _story_store.default();
      expect(store.dumpStoryBook()).toEqual([]);
    });
    it('should return storybook with stories', function () {
      var store = new _story_store.default();
      store.addStory('kind-1', 'story-1.1', function () {
        return 0;
      });
      store.addStory('kind-1', 'story-1.2', function () {
        return 0;
      });
      store.addStory('kind-2', 'story-2.1', function () {
        return 0;
      });
      store.addStory('kind-2', 'story-2.2', function () {
        return 0;
      });
      expect(store.dumpStoryBook()).toEqual([{
        kind: 'kind-1',
        stories: ['story-1.1', 'story-1.2']
      }, {
        kind: 'kind-2',
        stories: ['story-2.1', 'story-2.2']
      }]);
    });
  });
  describe('getStoryFileName', function () {
    it('should return the filename of the first story passed for the kind', function () {
      var store = new _story_store.default();
      store.addStory('kind-1', 'story-1.1', function () {
        return 0;
      }, {
        fileName: 'foo.js'
      });
      store.addStory('kind-1', 'story-1.2', function () {
        return 0;
      }, {
        fileName: 'foo-2.js'
      });
      store.addStory('kind-2', 'story-2.1', function () {
        return 0;
      }, {
        fileName: 'bar.js'
      });
      expect(store.getStoryFileName('kind-1')).toBe('foo.js');
      expect(store.getStoryFileName('kind-2')).toBe('bar.js');
    });
  });
  describe('removeStoryKind', function () {
    it('should not error even if there is no kind', function () {
      var store = new _story_store.default();
      store.removeStoryKind('kind');
    });
  });
  describe('getStoryAndParameters', function () {
    it('should return parameters that we passed in', function () {
      var store = new _story_store.default();
      var story = jest.fn();
      var parameters = {
        fileName: 'foo.js',
        parameter: 'value'
      };
      store.addStory('kind', 'name', story, parameters);
      expect(store.getStoryAndParameters('kind', 'name')).toEqual({
        story: story,
        parameters: parameters
      });
    });
  });
  describe('getStoryWithContext', function () {
    it('should return a function that calls the story with the context', function () {
      var store = new _story_store.default();
      var story = jest.fn();
      var parameters = {
        fileName: 'foo.js',
        parameter: 'value'
      };
      store.addStory('kind', 'name', story, parameters);
      var storyWithContext = store.getStoryWithContext('kind', 'name');
      storyWithContext();
      expect(story).toHaveBeenCalledWith({
        kind: 'kind',
        story: 'name',
        parameters: parameters
      });
    });
  });
});