'use strict';

var File = require('vinyl');
var through = require('through2');
var groupBy = require('group-array');

module.exports = function() {
  var files = [];
  var options = {};
  var args = [].slice.call(arguments);
  if (typeof args[args.length - 1] === 'object') {
    options = args.pop();
  }

  return through.obj(function(file, enc, cb) {
    files.push(file);
    cb(null);
  }, function(cb) {
    args = [files].concat(args);
    var group = groupBy.apply(null, args);
    if (typeof options.groupFn === 'function') {
      options.groupFn(group);
    }

    if (options.groupFile === true) {
      var file = new File({group: group});
      this.push(file);
    }

    if (options.flush !== false) {
      toStream(this, files);
    }
    cb();
  });
};

function toStream(stream, files) {
  files.forEach(function(file) {
    stream.push(file);
  });
}
