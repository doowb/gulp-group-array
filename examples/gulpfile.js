'use strict';

var path = require('path');
var gulp = require('gulp');
var extname = require('gulp-extname');
var extend = require('extend-shallow');
var Handlebars = require('handlebars');
var matter = require('gulp-gray-matter');
var through = require('through2');

var groupArray = require('../');

gulp.task('render', function() {
  var cache = {groups: {}};

  // load handlebars files that have yaml front matter
  return gulp.src([path.join(__dirname, 'templates/*.hbs')])

    // use gulp-gray-matter to parse yaml front matter and put it on `.data` object
    .pipe(matter())

    // look for `data.tags` from the front matter to group by and push the results into the stream
    .pipe(groupArray('data.tags', { groupFile: true }))

    // custom plugin that captures the tags group and renders the other handlebars files.
    .pipe(through.obj(function(file, enc, cb) {
      // the first file through should be the groupFile
      if (file.group) {
        cache.groups.tags = file.group;
        return cb();
      }

      // use extend-shallow to create a data context from the file front matter and the cache
      var context = extend({}, cache, file.data);

      // render the handlebars using the context
      var content = Handlebars.compile(file.contents.toString())(context);
      file.contents = new Buffer(content);
      cb(null, file);
    }))
    .pipe(extname())
    .pipe(gulp.dest(path.join(__dirname, 'dist')));
});
