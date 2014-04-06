'use strict';

var RSVP         = require('rsvp');
var UI           = require('../ui');
var parseArgv    = require('./parse-argv');
var loadCommands = require('./load-commands');
var loadTasks    = require('./load-tasks');
var findProject  = require('./find-project');

module.exports = cli;
function cli(options) {
  var ui = new UI({
    inputStream: options.inputStream,
    outputStream: options.outputStream
  });

  var environment = {
    ui: ui,
    commands: loadCommands(),
    tasks: loadTasks(),
    project: findProject()
  };

  return RSVP.hash(environment)
    .then(function(environment) {
      // Parse argv, returns null and writes message to ui if it fails
      var parsingOutput = parseArgv(environment, options.argv);

      // If the command was found, run it!
      if (parsingOutput) {
        return parsingOutput.command.run(
            environment,
            parsingOutput.commandOptions
          );
      }
    })
    .catch(function(error) {
      // The error being falsy signifies that it has been handled
      if (error) { ui.write(error); }
    });
}