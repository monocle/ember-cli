'use strict';

var walkSync = require('../../../lib/utilities/walk-sync').walkSync;
var ember = require('../../helpers/ember');
var assert = require('../../helpers/assert');
var RSVP = require('rsvp');
var fs = require('fs');
var denodeify = RSVP.denodeify;
var readFile = denodeify(fs.readFile);
var statSync = fs.statSync;

require('../../../lib/ext/promise');

var basePath, origDir;

describe('ember build', function() {

  ['sass', 'less'].forEach(function(processor) {
    describe(processor, function() {

      beforeEach(function() {
        basePath = '../../tests/acceptance/preprocessors/' + processor + '/output/';
        origDir = process.cwd();
        process.chdir('./tmp/' + processor);
        return ember(['build']);
      });

      afterEach(function() {
        process.chdir(origDir);
      });

      it('preprocesses ' + processor, function() {
        var actual = walkSync(basePath);


        var files = actual.filter(function(file) {
          return statSync(basePath + file).isFile();
        }).map(function(actual) {
          return RSVP.hash({
            expected: readFile(basePath + actual),
            actual: readFile('./dist/' + actual)
          });
        });

        var compares = RSVP.filter(files, function(output) {
          return output.expected.toString() === output.actual.toString();
        });

        return compares.then(function(trues) {
          assert.equal(trues.length, files.length);
        });
      });
    });
  });
});
