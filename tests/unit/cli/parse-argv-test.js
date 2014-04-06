'use strict';
/*jshint expr: true*/

var expect    = require('chai').expect;
var parseArgv = require('../../../lib/cli/parse-argv');
var UI        = require('../../../lib/ui');
var through   = require('through');

describe('cli/parse-argv.js', function() {
  var output = [];

  var environment = {
    commands: {
      serve: {
        name: 'serve',
        key: 'serve',
        aliases: ['s'],
        options: [
          { name: 'port', key: 'port', type: Number, default: 4200, required: true }
        ]
      },
      developEmberCLI: {
        name: 'develop-ember-cli',
        key: 'developEmberCLI',
        aliases: [],
        options: [
          { name: 'package-name', key: 'packageName', type: String, required: true }
        ]
      }
    },
    ui: new UI({
      inputStream: through(),
      outputStream: through(function(data) { output.push(data); })
    })
  };

  var parse = parseArgv.bind(null, environment);

  it('parseArgv() should find commands by name and aliases.', function() {
    output = [];

    // Valid commands
    expect(parse(['ember', 'serve'])).to.exist;
    expect(parse(['ember', 's'])).to.exist;

    // Invalid command
    expect(parse(['ember', 'something-else'])).to.be.null;
    expect(output.shift()).to.match(/command.*something-else.*is invalid/);
  });

  it('parseArgv() should find the command options.', function() {
    expect(parse(['ember', 's', '--port', '80']).commandOptions).to.include({
      port: 80
    });
  });

  it('parseArgv() should find abbreviated command options.', function() {
    expect(parse(['ember', 's', '-p', '80']).commandOptions).to.include({
      port: 80
    });
  });

  it('parseArgv() should set default option values.', function() {
    expect(parse(['ember', 's']).commandOptions).to.include({
      port: 4200
    });
  });

  it('parseArgv() should print a message if a required option is missing', function() {
    expect(parse(['ember', 'develop-ember-cli'])).to.be.null;
    expect(output.shift()).to.match(/requires the option.*package-name/);
  });
});
