'use strict';

var chalk = require('chalk');

module.exports = {
  works: 'everywhere',
  options: [
    { name: 'dry-run', type: Boolean }
  ],
  run: function(environment, options) {
    var installBlueprint = environment.tasks.installBlueprint;
    var npmInstall       = environment.tasks.npmInstall;
    var bowerInstall     = environment.tasks.bowerInstall;

    return installBlueprint({
        dryRun: options.dryRun
      })
      .then(npmInstall)
      .then(bowerInstall);
  },
  usageInstructions: function() {
    return 'ember init ' + chalk.green('<app-name>');
  }
};
