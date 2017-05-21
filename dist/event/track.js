'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function validateTrackFields(fields, actionType) {
  if (typeof actionType !== 'string' && !fields.event) {
    return new Error('missing event field for EventTypes.track');
  }

  return null;
}

function getTrackProperties(fields) {
  var temp = ['event'];
  temp.push.apply(temp, _toConsumableArray(Object.keys(fields)));

  return temp;
}

function extractFields(obj, keys, actionType) {
  return keys.map(function (key) {
    return key === 'event' ? obj[key] || actionType : obj[key];
  });
}

function extractTrackFields(fields, actionType) {
  var props = getTrackProperties(fields);

  var err = validateTrackFields(fields, actionType);
  if (err) return err;

  return extractFields(fields, props, actionType);
}

exports.extractTrackFields = extractTrackFields;