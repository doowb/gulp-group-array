'use strict';

require('mocha');
var assert = require('assert');
var File = require('vinyl');
var through = require('through2');

var groupArray = require('./');

describe('gulp-group-array', function() {
  it('should export a function', function() {
    assert.equal(typeof groupArray, 'function');
  });

  it('should group a file with a data property', function(cb) {
    var stream = through.obj();
    var files = [];
    stream.pipe(groupArray('data.tags', {
        groupFn: function(group) {
          assert(typeof group === 'object');
          assert.deepEqual(Object.keys(group), ['foo']);
          assert.equal(group.foo[0].path, 'one.hbs');
        }
      }))
      .once('error', cb)
      .on('data', function() {})
      .on('end', function() {
        cb();
      });

    process.nextTick(function() {
      var file = new File({path: 'one.hbs', contents: new Buffer('')});
      file.data = {tags: ['foo']};
      stream.write(file);
      stream.end();
    });
  });

  it('should group files with data properties', function(cb) {
    var stream = through.obj();
    var files = [];
    stream.pipe(groupArray('data.tags', {
        groupFn: function(group) {
          assert(typeof group === 'object');
          assert.deepEqual(Object.keys(group), ['foo', 'bar']);
          for (var i = 0; i < 10; i++) {
            assert.equal(group.foo[i].path, `file-${i}.hbs`);
            assert.equal(group.bar[i].path, `file-${i}.hbs`);
          }
        }
      }))
      .once('error', cb)
      .on('data', function() {})
      .on('end', function() {
        cb();
      });

    process.nextTick(function() {
      for (var i = 0; i < 10; i++) {
        var file = new File({path: `file-${i}.hbs`, contents: new Buffer('')});
        file.data = {tags: ['foo', 'bar']};
        stream.write(file);
      }
      stream.end();
    });
  });

  it('should group files with different data', function(cb) {
    var stream = through.obj();
    var files = [];
    stream.pipe(groupArray('data.tags', {
        groupFn: function(group) {
          assert(typeof group === 'object');
          assert.deepEqual(Object.keys(group), ['foo', 'bar']);
          var iFoo = 0, iBar = 0;
          for (var i = 0; i < 10; i++) {
            if (i % 2 === 0) {
              assert.equal(group.foo[iFoo++].path, `file-${i}.hbs`);
            } else if (i % 3 === 0) {
              assert.equal(group.bar[iBar++].path, `file-${i}.hbs`);
            }
          }
        }
      }))
      .once('error', cb)
      .on('data', function() {})
      .on('end', function() {
        cb();
      });

    process.nextTick(function() {
      for (var i = 0; i < 10; i++) {
        var file = new File({path: `file-${i}.hbs`, contents: new Buffer('')});
        if (i % 2 === 0 || i % 3 === 0) {
          file.data = {tags: [(i % 2 === 0) ? 'foo' : 'bar']};
        }
        stream.write(file);
      }
      stream.end();
    });
  });

  it('should group files using custom functions', function(cb) {
    var stream = through.obj();
    var files = [];
    var path = require('path');
    var groupBy = function(file) {
      var segs = file.dirname.split(/[\/\\]+/);
      return segs[segs.length - 1];
    };

    stream.pipe(groupArray(groupBy, {
        groupFn: function(group) {
          assert(typeof group === 'object');
          assert.deepEqual(Object.keys(group), ['foo', 'bar']);
          for (var i = 0; i < 10; i++) {
            assert.equal(group.foo[i].basename, `file-${i}.hbs`);
            assert.equal(group.foo[i].dirname, path.resolve('foo'));
            assert.equal(group.bar[i].basename, `file-${i}.hbs`);
            assert.equal(group.bar[i].dirname, path.resolve('bar'));
          }
        }
      }))
      .once('error', cb)
      .on('data', function() {})
      .on('end', function() {
        cb();
      });

    process.nextTick(function() {
      for (var i = 0; i < 10; i++) {
        var file = new File({path: path.resolve(`foo/file-${i}.hbs`), contents: new Buffer('')});
        stream.write(file);
      }
      for (var i = 0; i < 10; i++) {
        var file = new File({path: path.resolve(`bar/file-${i}.hbs`), contents: new Buffer('')});
        stream.write(file);
      }
      stream.end();
    });
  });

  it('should group files and push a new file into the stream with the group on it', function(cb) {
    var stream = through.obj();
    var files = [];
    stream.pipe(groupArray('data.tags', {groupFile: true}))
      .once('error', cb)
      .on('data', function(file) {
        var group = file.group;
        if (!group) return;
        assert(typeof group === 'object');
        assert.deepEqual(Object.keys(group), ['foo']);
        assert.equal(group.foo[0].path, 'one.hbs');
      })
      .on('end', function() {
        cb();
      });

    process.nextTick(function() {
      var file = new File({path: 'one.hbs', contents: new Buffer('')});
      file.data = {tags: ['foo']};
      stream.write(file);
      stream.end();
    });
  });

  it('should not flush source files through when `options.flush === false`', function(cb) {
    var stream = through.obj();
    var files = [];
    stream.pipe(groupArray('data.tags', {flush: false}))
      .once('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .on('end', function() {
        assert.equal(files.length, 0);
        cb();
      });

    process.nextTick(function() {
      var file = new File({path: 'one.hbs', contents: new Buffer('')});
      file.data = {tags: ['foo']};
      stream.write(file);
      stream.end();
    });
  });

  it('should create a new group file and push it into the stream when `options.groupFile === true`', function(cb) {
    var stream = through.obj();
    var files = [];
    stream.pipe(groupArray('data.tags', {groupFile: true}))
      .once('error', cb)
      .on('data', function(file) {
        files.push(file);
        var group = file.group;
        if (!group) return;
        assert(typeof group === 'object');
        assert.deepEqual(Object.keys(group), ['foo']);
        assert.equal(group.foo[0].path, 'one.hbs');
      })
      .on('end', function() {
        assert.equal(files.length, 2);
        cb();
      });

    process.nextTick(function() {
      var file = new File({path: 'one.hbs', contents: new Buffer('')});
      file.data = {tags: ['foo']};
      stream.write(file);
      stream.end();
    });
  });

  it('should create a new group file when `options.groupFile === true` and not push source files through when `options.flush === false`', function(cb) {
    var stream = through.obj();
    var files = [];
    stream.pipe(groupArray('data.tags', {groupFile: true, flush: false}))
      .once('error', cb)
      .on('data', function(file) {
        files.push(file);
        var group = file.group;
        assert(typeof group === 'object');
        assert.deepEqual(Object.keys(group), ['foo']);
        assert.equal(group.foo[0].path, 'one.hbs');
      })
      .on('end', function() {
        assert.equal(files.length, 1);
        cb();
      });

    process.nextTick(function() {
      var file = new File({path: 'one.hbs', contents: new Buffer('')});
      file.data = {tags: ['foo']};
      stream.write(file);
      stream.end();
    });
  });
});
