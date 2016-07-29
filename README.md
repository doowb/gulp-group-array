# gulp-group-array [![NPM version](https://img.shields.io/npm/v/gulp-group-array.svg?style=flat)](https://www.npmjs.com/package/gulp-group-array) [![NPM downloads](https://img.shields.io/npm/dm/gulp-group-array.svg?style=flat)](https://npmjs.org/package/gulp-group-array) [![Build Status](https://img.shields.io/travis/doowb/gulp-group-array.svg?style=flat)](https://travis-ci.org/doowb/gulp-group-array)

Gulp plugin to group vinyl files by properties on the vinyl file using group-array.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save gulp-group-array
```

## Usage

```js
var groupArray = require('gulp-group-array');
```

## API

### [groupArray](index.js#L30)

Group vinyl files by specified properties on the vinyl files. This uses [group-array](https://github.com/doowb/group-array) to do the grouping after all the vinyl files have come through the stream. See the [group-array](https://github.com/doowb/group-array) documentation for more advanced features.

**Params**

* `args...` **{Mixed}**: All of the arguments will be passed through to [group-array](https://github.com/doowb/group-array) except for the last argument if it's an object.
* `options` **{Object}**: Optional object to specify options. If this is passed, then it won't be passed to [group-array](https://github.com/doowb/group-array).
* `options.groupFn` **{Function}**: Function that will be called with the `group` object. This is the results from calling [group-array](https://github.com/doowb/group-array).
* `options.flush` **{Boolean}**: When set to `false`, the source files will not be pushed through the stream. (Defaults to `true`)
* `options.groupFile` **{Boolean}**: When set to `true`, a new vinyl file will be created with a `.group` property containing the group object created by [group-array](https://github.com/doowb/group-array).
* `returns` **{Stream}**: Returns a stream to pipe vinyl source files through.

**Example**

```js
gulp.task('group', function() {
  return gulp.src(['path/to/src/files/*.js'])
    .pipe(groupArray('dirname', {
      groupFn: function(group) { console.log(group); }
    }));
});
```

## Examples

Use the `groupFn` to capture the group to use the group in another place:

```js
var cache = {};
gulp.task('group', function() {
  return gulp.src(['path/to/src/files/*.js'])
    .pipe(groupArray('dirname', {
      groupFn: function(group) {
        cache.group = group;
      }
    }));
});

gulp.task('default', ['group'], function(cb) {
  // do something with the group
  console.log(cache.group);
  cb();
});
```

Use `groupFile` to get the group in another plugin before the other files come through. This example will use [gulp-gray-matter](https://github.com/simbo/gulp-gray-matter) to parse yaml front matter from [handlebars](http://www.handlebarsjs.com/) templates, build a `context` for each file using the `group` and the `file.data`, then render the [handlebars](http://www.handlebarsjs.com/) templates to html using the `context`.

This example requires having some [handlebars](http://www.handlebarsjs.com/) templates with yaml front-matter.
Create a few files with the following template:

```handlebars
---
tags: ['foo', 'bar']
---
{{#each groups.tags as |items tag|}}
  <div>{{tag}}</div>
  <ul>
  {{#each items as |item|}}
    <li>{{item.path}}</li>
  {{/each}}
  </ul>
{{/each}}
```

Use the following javascript in a `gulpfile.js` to render the files:

```js
var gulp = require('gulp');
var extname = require('gulp-extname');
var extend = require('extend-shallow');
var Handlebars = require('handlebars');
var matter = require('gulp-gray-matter');
var through = require('through2');

var groupArray = require('gulp-group-array');

gulp.task('render', function() {
  var cache = {groups: {}};

  // load handlebars files that have yaml front matter
  return gulp.src(['templates/*.hbs'])

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
    .pipe(gulp.dest('dist'));
});
```

Run the following command to render the files:

```sh
$ gulp render
```

## About

### Related projects

* [group-array](https://www.npmjs.com/package/group-array): Group array of objects into lists. | [homepage](https://github.com/doowb/group-array "Group array of objects into lists.")
* [gulp](https://www.npmjs.com/package/gulp): The streaming build system | [homepage](http://gulpjs.com "The streaming build system")
* [vinyl](https://www.npmjs.com/package/vinyl): A virtual file format | [homepage](http://github.com/gulpjs/vinyl "A virtual file format")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Building docs

_(This document was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme) (a [verb](https://github.com/verbose/verb) generator), please don't edit the readme directly. Any changes to the readme must be made in [.verb.md](.verb.md).)_

To generate the readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install -g verb verb-generate-readme && verb
```

### Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

### Author

**Brian Woodward**

* [github/doowb](https://github.com/doowb)
* [twitter/doowb](http://twitter.com/doowb)

### License

Copyright © 2016, [Brian Woodward](https://github.com/doowb).
Released under the [MIT license](https://github.com/doowb/gulp-group-array/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on July 29, 2016._