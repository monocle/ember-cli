'use strict';

var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var glob = RSVP.denodeify(require('glob'));
var path = require('path');
var camelize = require('../utilities/string').camelize;

module.exports =
function() {
  return glob(__dirname + '/../tasks/*.js').then(buildHash);
}

function buildHash(files) {
  return files.reduce(function(tasks, file) {
    var task = require(file);

    // Set optional properties
    task.name = task.name || path.basename(file, '.js');
    task.key = task.key || camelize(task.name);

    if (!task.run) {
      throw new Error('Task ' + task.name + ' has no run() defined.');
    }

    // Add task to tasks hash
    tasks[task.key] = task;

    return tasks;
  }, {});
}
