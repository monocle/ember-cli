'use strict';

var RSVP = require('rsvp');
var denodeify = RSVP.denodeify;
var ncp = denodeify(require('ncp'));
var npm = require('npm');
var tmp = require('../tests/helpers/tmp');
var sequence = require('../lib/utilities/sequence');
var ember = require('../tests/helpers/ember');

var preprocessors = {
  'sass': 'broccoli-sass',
  'less': 'broccoli-less-single'
};

module.exports = function(grunt) {
  grunt.registerTask('test:prepare', ['test:prepare:tmp', 'test:prepare:preprocessors']);

  grunt.registerTask('test:prepare:preprocessors', function() {
    var done = this.async();
    var tasks = [];


    for(var processor in preprocessors) {
      var plugin = preprocessors[processor];
      tasks = tasks.concat(setup({
        name: processor,
        plugin: plugin
      }));
    }

    sequence(tasks).then(done);
  });

  grunt.registerTask('test:prepare:tmp', function() {
    var done = this.async();
    tmp.setup('./tmp/fixture');
    var origDir = process.cwd();
    process.chdir('./tmp/fixture');
    ember(['init']).then(function() {
      process.chdir(origDir);
      done();
    });
  });


  function copyBaseFixture(dest) {
    console.log('copyBaseFixture', dest);
    return ncp('./tmp/fixture', dest).then(function() {
      console.log('done');
    });
  }

  function installFixtures(dest) {
    console.log('ncp');
    return ncp('./tests/acceptance/preprocessors/sass/fixture/', dest).then(function() {
      console.log('resolved');
    }).catch(function(error) {
      console.log('rejected', error);
    });
  }

  function installPlugin(name, dest) {
    var origDir = process.cwd();
    process.chdir(dest);
    return new RSVP.Promise(function(resolve, reject) {
      npm.load({'save-dev': true}, function(error) {
        if(error) { reject(error); }
        npm.commands.install([name], function(error) {
          if(error) { reject(error); }
          process.chdir(origDir);
          resolve();
        });
      });
    });
  }


  function setup(processor) {
    var dir = './tmp/' + processor.name;
    return [
      copyBaseFixture.bind(null, dir),
      installPlugin.bind(null, processor.plugin, dir),
      installFixtures.bind(null,dir)
    ];
  }

};
