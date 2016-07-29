'use strict';

require('mocha');
var assert = require('assert');
var gulpGroupArray = require('./');

describe('gulp-group-array', function() {
      it('should export a function', function() {
    assert.equal(typeof gulpGroupArray, 'function');
  });

    it('should export an object', function() {
    assert(gulpGroupArray);
    assert.equal(typeof gulpGroupArray, 'object');
  });

    it('should throw an error when invalid args are passed', function(cb) {
    try {
      gulpGroupArray();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected first argument to be a string');
      assert.equal(err.message, 'expected a callback function');
      cb();
    }
  });
});
