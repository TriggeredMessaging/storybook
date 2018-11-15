"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _addons = _interopRequireDefault(require("@storybook/addons"));

var _coreEvents = _interopRequireDefault(require("@storybook/core-events"));

var _global = require("global");

var _start4 = _interopRequireDefault(require("./start"));

jest.mock('@storybook/client-logger');
jest.mock('@storybook/addons');
jest.mock('global', function () {
  return {
    navigator: {
      userAgent: 'browser'
    },
    window: {
      addEventListener: jest.fn(),
      location: {
        search: ''
      },
      history: {
        replaceState: jest.fn()
      }
    },
    document: {
      addEventListener: jest.fn(),
      getElementById: jest.fn().mockReturnValue({}),
      body: {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        }
      },
      documentElement: {}
    }
  };
});

function mockEmit() {
  var emit = jest.fn();

  _addons.default.getChannel.mockReturnValue({
    emit: emit
  });

  return emit;
}

it('renders nopreview when you have no stories', function () {
  var emit = mockEmit();
  var render = jest.fn();
  (0, _start4.default)(render);
  expect(render).not.toHaveBeenCalled();
  expect(_global.document.body.classList.add).toHaveBeenCalledWith('sb-show-nopreview');
  expect(emit).toHaveBeenCalledWith(_coreEvents.default.STORY_RENDERED);
});
it('calls render when you add a story', function () {
  var emit = mockEmit();
  var render = jest.fn();

  var _start = (0, _start4.default)(render),
      clientApi = _start.clientApi,
      configApi = _start.configApi;

  emit.mockReset();
  configApi.configure(function () {
    clientApi.storiesOf('kind', {}).add('story', function () {});
  }, {});
  expect(render).toHaveBeenCalled();
  expect(emit).toHaveBeenCalledWith(_coreEvents.default.STORY_RENDERED);
});
it('emits an exception and shows error when your story throws', function () {
  var emit = mockEmit();
  var render = jest.fn().mockImplementation(function () {
    throw new Error('Some exception');
  });

  var _start2 = (0, _start4.default)(render),
      clientApi = _start2.clientApi,
      configApi = _start2.configApi;

  emit.mockReset();

  _global.document.body.classList.add.mockReset();

  configApi.configure(function () {
    clientApi.storiesOf('kind', {}).add('story', function () {});
  }, {});
  expect(render).toHaveBeenCalled();
  expect(_global.document.body.classList.add).toHaveBeenCalledWith('sb-show-errordisplay');
  expect(emit).toHaveBeenCalledWith(_coreEvents.default.STORY_THREW_EXCEPTION, expect.any(Error));
});
it('emits an error and shows error when your framework calls showError', function () {
  var emit = mockEmit();
  var error = {
    title: 'Some error',
    description: 'description'
  };
  var render = jest.fn().mockImplementation(function (_ref) {
    var showError = _ref.showError;
    showError(error);
  });

  var _start3 = (0, _start4.default)(render),
      clientApi = _start3.clientApi,
      configApi = _start3.configApi;

  emit.mockReset();

  _global.document.body.classList.add.mockReset();

  configApi.configure(function () {
    clientApi.storiesOf('kind', {}).add('story', function () {});
  }, {});
  expect(render).toHaveBeenCalled();
  expect(_global.document.body.classList.add).toHaveBeenCalledWith('sb-show-errordisplay');
  expect(emit).toHaveBeenCalledWith(_coreEvents.default.STORY_ERRORED, error);
});