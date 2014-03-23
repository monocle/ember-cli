'use strict';

var Promise = require('rsvp').Promise;
var Insight = require('insight');

// TODO: All this work just to get a promise-based API seems bad.
// We should probably just make Insight support promises.
// But this is getting exhausting, and I need to move on to
// something more important.

function delegate(source, dest) {
  function __makeDelegator(name, obj) {
    return function() {
      obj[name].apply(obj, arguments);
    };
  }

  for(var key in dest) {
    if(!dest.__proto__.hasOwnProperty(key)) { continue; }
    if(key === 'askPermission') { continue; }
    source[key] = __makeDelegator(key, dest);
  }
}

function InsightWrapper(options) {
  this.insight = options.insight || new Insight(options);
  delegate(this, this.insight);
}

module.exports = InsightWrapper;

InsightWrapper.prototype.askPermission = function(message) {
  var _this = this;
  return new Promise(function(resolve) {
    _this.insight.askPermission(message, function(optOut) {
      resolve(optOut);
    });
  });
};
