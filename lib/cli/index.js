'use strict';

var RSVP         = require('rsvp');
var Promise      = RSVP.Promise;
var ui           = require('../ui');
var parseArgv    = require('./parse-argv');
var loadCommands = require('./load').loadCommands;
var loadTasks    = require('./load').loadTasks;
var merge        = require('lodash-node/modern/objects/merge');

module.exports =
function cli(options) {
  var argv = options.argv || process.argv;

  return Promise.all([loadCommands(), loadTasks()])
    .then(function(result) {
      // The environment will get passed around
      var environment = {
        ui: new UI({
          inputStream: options.inputStream || process.stdin,
          outputStream: options.outputStream || process.stdout
        }),
        commands: result[0],
        tasks: result[1]
      };

      // Parse argv, returns null and writes message to ui if it fails
      var parsingOutput = parseArgv(environment, argv);

      // If the command was found, run it!
      if (parsingOutput) {
        return prasingOutput.command.run(
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
