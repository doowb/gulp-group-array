'use strict';

var VinylGroup = require('vinyl-group');
var through = require('through2');
var groupBy = require('group-array');

/**
 * Group vinyl files by specified properties on the vinyl files.
 * This uses [group-array][] to do the grouping after all the vinyl files have come through the stream.
 * See the [group-array][] documentation for more advanced features.
 *
 * ```js
 * gulp.task('group', function() {
 *   return gulp.src(['path/to/src/files/*.js'])
 *     .pipe(groupArray('dirname', {
 *       groupFn: function(group) { console.log(group); }
 *     }));
 * });
 * ```
 *
 * @param  {Mixed}    `args...` All of the arguments will be passed through to [group-array][] except for the last argument if it's an object.
 * @param  {Object}   `options` Optional object to specify options. If this is passed, then it won't be passed to [group-array][].
 * @param  {Function} `options.groupFn` Function that will be called with the `group` object. This is the results from calling [group-array][].
 * @param  {Boolean}  `options.flush` When set to `false`, the source files will not be pushed through the stream. (Defaults to `true`)
 * @param  {Boolean}  `options.groupFile` When set to `true`, a new [vinyl-group][] will be created with a `.group` property containing the group object created by [group-array][].
 * @returns {Stream}  Returns a stream to pipe vinyl source files through.
 * @api public
 */

module.exports = function groupArray() {
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
      var vinylGorup = new VinylGroup(group);
      this.push(vinylGorup);
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
