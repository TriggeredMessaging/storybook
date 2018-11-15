"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.createSubscriptionsStore = void 0;

var createSubscriptionsStore = function createSubscriptionsStore() {
  var subscripions = new Map();
  return {
    register: function register(subscribe) {
      var subscription = subscripions.get(subscribe);

      if (!subscription) {
        subscription = {
          unsubscribe: subscribe()
        };
        subscripions.set(subscribe, subscription);
      }

      subscription.used = true;
    },
    markAllAsUnused: function markAllAsUnused() {
      subscripions.forEach(function (subscription) {
        // eslint-disable-next-line no-param-reassign
        subscription.used = false;
      });
    },
    clearUnused: function clearUnused() {
      subscripions.forEach(function (subscripion, key) {
        if (subscripion.used) return;
        subscripion.unsubscribe();
        subscripions.delete(key);
      });
    }
  };
};

exports.createSubscriptionsStore = createSubscriptionsStore;

var _default = createSubscriptionsStore();

exports.default = _default;