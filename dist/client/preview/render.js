"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderMain;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _global = require("global");

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _commonTags = require("common-tags");

var _element_check = _interopRequireDefault(require("./element_check"));

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n         Seems like you are not returning a correct React element from the story.\n         Could you double check that?\n       "]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n        Did you forget to return the React element from the story?\n        Use \"() => (<MyComp/>)\" or \"() => { return <MyComp/>; }\" when defining the story.\n      "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var rootEl = _global.document.getElementById('root');

function render(node, el) {
  _reactDom.default.render(process.env.STORYBOOK_EXAMPLE_APP ? _react.default.createElement(_react.default.StrictMode, null, node) : node, el);
}

function renderMain(_ref) {
  var story = _ref.story,
      selectedKind = _ref.selectedKind,
      selectedStory = _ref.selectedStory,
      showMain = _ref.showMain,
      showError = _ref.showError,
      forceRender = _ref.forceRender;
  var element = story();

  if (!element) {
    showError({
      title: "Expecting a React element from the story: \"".concat(selectedStory, "\" of \"").concat(selectedKind, "\"."),
      description: (0, _commonTags.stripIndents)(_templateObject())
    });
    return;
  }

  if (!(0, _element_check.default)(element)) {
    showError({
      title: "Expecting a valid React element from the story: \"".concat(selectedStory, "\" of \"").concat(selectedKind, "\"."),
      description: (0, _commonTags.stripIndents)(_templateObject2())
    });
    return;
  } // We need to unmount the existing set of components in the DOM node.
  // Otherwise, React may not recrease instances for every story run.
  // This could leads to issues like below:
  //    https://github.com/storybooks/react-storybook/issues/81
  // But forceRender means that it's the same story, so we want too keep the state in that case.


  if (!forceRender) {
    _reactDom.default.unmountComponentAtNode(rootEl);
  }

  showMain();
  render(element, rootEl);
}