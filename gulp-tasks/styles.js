'use strict';

var gulp = require('gulp');
var del = require('del');
var plugins = require('gulp-load-plugins')();
var googleWebFonts = require('./custom-plugins/gulp-google-web-fonts');

// Browser support for autoprefix
var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

gulp.task('inline-fonts', function() {
  return gulp.src(GLOBAL.WF.src.styles + '/partials/_google-fonts.scss')
    .pipe(googleWebFonts({
      fontsurl: 'http://fonts.googleapis.com/css?family=Roboto',
      replaceAll: true,
      sassVariant: true
    }))
    .pipe(gulp.dest(GLOBAL.WF.src.styles + '/partials/'));
});

// This function is used by generate-dev-css and generate-prod-css
function compileSassAutoprefix(genSourceMaps) {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
      // TODO: This seems to speed up ever so slighty - maybe move imports
      // to a seperate repo to improve further by only including
      // a src of files we KNOW we want sass plugin to explore
      '!' + GLOBAL.WF.src.styles + '/**/_*.scss',
      GLOBAL.WF.src.styles + '/**/*.scss'
    ])
    .pipe(plugins.if(genSourceMaps, plugins.sourcemaps.init()))
    .pipe(plugins.sass({
      precision: 10
    })
    .on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer(AUTOPREFIXER_BROWSERS));
}

// generate-dev-css simply pipes the compiled sass to the build directory
// and writes the sourcemaps
gulp.task('generate-dev-css', ['styles:clean', 'inline-fonts'], function() {
  return compileSassAutoprefix(true)
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(GLOBAL.WF.build.styles))
    .pipe(plugins.size({title: 'generate-dev-css'}));
});

// generate-prod-css is the same as generate-dev-css
// except it minifies and optimises the CSS and
// skips generating the sourcemaps which account for
// a lot of weight
gulp.task('generate-prod-css', ['styles:clean', 'inline-fonts'], function() {
  return compileSassAutoprefix(false)
    .pipe(plugins.if('*.css', plugins.csso()))
    .pipe(gulp.dest(GLOBAL.WF.build.styles))
    .pipe(plugins.size({title: 'generate-css'}));
});

gulp.task('styles:clean', del.bind(null,
  [GLOBAL.WF.build.styles], {dot: true}));