'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventTypes = exports.createMetaReducer = exports.createTracker = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('./utils');

var _types = require('./event/types');

var _types2 = _interopRequireDefault(_types);

var _configuration = require('./event/configuration');

var _identify = require('./event/identify');

var _page = require('./event/page');

var _track = require('./event/track');

var _alias = require('./event/alias');

var _group = require('./event/group');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function emit(type, fields, _ref) {
  var client = _ref.client;

  var currentClient = client();

  if (typeof currentClient[type] === 'function') {
    if (fields[1] && fields[1].action) {
      fields[0] = fields[1].action;
    }
    currentClient[type].apply(currentClient, _toConsumableArray(fields));
  } else {
    (0, _utils.warn)('The analytics client you provided doesn\'t support ' + type + ' events.');
  }
}

function createTracker() {
  var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var options = {
    mapper: _extends({}, _configuration.defaultMapper.mapper, customOptions.mapper),
    client: customOptions.client ? function () {
      return customOptions.client;
    } : _configuration.defaultClient
  };

  if (!options.client) {
    (0, _utils.warn)('Could not find an analytics client. Provide a client to' + 'createTracker or make sure that the anaytics.js script' + 'is loaded and executed before your application code.');
  }

  return function (store) {
    return function (next) {
      return function (action) {
        return handleAction(store.getState.bind(store), next, action, options);
      };
    };
  };
}

function createMetaReducer() {
  var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var options = {
    mapper: _extends({}, _configuration.defaultMapper.mapper, customOptions.mapper),
    client: customOptions.client ? function () {
      return customOptions.client;
    } : _configuration.defaultClient
  };

  if (!options.client) {
    (0, _utils.warn)('Could not find an analytics client. Provide a client to' + 'createTracker or make sure that the anaytics.js script' + 'is loaded and executed before your application code.');
  }

  return function (reducer) {
    return function (prevState, action) {

      if (action.meta && action.meta.analytics) {
        return handleReducerSpec(reducer, prevState, action, options);
      }

      if (typeof options.mapper[action.type] === 'function') {
        var getState = function getState() {
          return prevState;
        };
        var analytics = options.mapper[action.type](getState, action);

        return handleReducerSpec(reducer, prevState, appendAction(action, analytics), options);
      }

      if (typeof options.mapper[action.type] === 'string') {
        var _analytics = { eventType: options.mapper[action.type] };
        return handleReducerSpec(reducer, prevState, appendAction(action, _analytics), options);
      }

      return reducer(prevState, action);
    };
  };
}

function handleReducerSpec(reducer, prevState, action, options) {
  var spec = action.meta.analytics;

  if (Array.isArray(spec)) {
    spec.forEach(function (s) {
      return handleIndividualSpec(s, action, options);
    });
  } else {
    handleIndividualSpec(spec, action, options);
  }

  return reducer(prevState, action);
}

function appendAction(action, analytics) {

  action.meta = _extends({}, action.meta, {
    analytics: Array.isArray(analytics) ? analytics : _extends({}, analytics)
  });

  return action;
}

function handleAction(getState, next, action, options) {

  if (action.meta && action.meta.analytics) {
    return handleSpec(next, action, options);
  }

  if (typeof options.mapper[action.type] === 'function') {

    var analytics = options.mapper[action.type](getState, action);
    return handleSpec(next, appendAction(action, analytics), options);
  }

  if (typeof options.mapper[action.type] === 'string') {

    var _analytics2 = { eventType: options.mapper[action.type] };
    return handleSpec(next, appendAction(action, _analytics2), options);
  }

  return next(action);
}

function getFields(type, fields, actionType) {
  var _typeFieldHandlers;

  var typeFieldHandlers = (_typeFieldHandlers = {}, _defineProperty(_typeFieldHandlers, _types2.default.identify, _identify.extractIdentifyFields), _defineProperty(_typeFieldHandlers, _types2.default.page, _page.extractPageFields), _defineProperty(_typeFieldHandlers, _types2.default.track, function (eventFields) {
    return (0, _track.extractTrackFields)(eventFields, actionType);
  }), _defineProperty(_typeFieldHandlers, _types2.default.alias, _alias.extractAliasFields), _defineProperty(_typeFieldHandlers, _types2.default.group, _group.extractGroupFields), _defineProperty(_typeFieldHandlers, _types2.default.reset, function () {
    return [];
  }), _typeFieldHandlers);

  return typeFieldHandlers[type](fields);
}

function getEventType(spec) {
  if (typeof spec === 'string') {
    return spec;
  }

  return spec.eventType;
}

function handleIndividualSpec(spec, action, options) {
  var type = getEventType(spec);

  // In case the eventType was not specified or set to `null`, ignore this individual spec.
  if (type && type.length) {
    var fields = getFields(type, spec.eventPayload || {}, action.type);

    if (fields instanceof Error) return (0, _utils.warn)(fields);

    emit(type, fields, options);
  }
}

function handleSpec(next, action, options) {
  var spec = action.meta.analytics;

  if (Array.isArray(spec)) {
    spec.forEach(function (s) {
      return handleIndividualSpec(s, action, options);
    });
  } else {
    handleIndividualSpec(spec, action, options);
  }

  return next(action);
}

exports.createTracker = createTracker;
exports.createMetaReducer = createMetaReducer;
exports.EventTypes = _types2.default;