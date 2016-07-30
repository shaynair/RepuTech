// This file uses Gulp plugins to automate tasks.

// Requires
const gulp = require("gulp");
const sourcemaps = require('gulp-sourcemaps');
const changed = require('gulp-changed');
const concat = require('gulp-concat');

// JS
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

// Images
const imagemin = require('gulp-imagemin');

// CSS
const nano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');

// Clean
const del = require('del');
 
const paths = {
  scripts: ['assets/scripts/*.js', 'public/assets/scripts'],
  images: ['assets/images/*', 'public/assets/images'],
  css: ['assets/stylesheets/*.css', 'public/assets/stylesheets'],
  icon: ['assets/*.ico', 'public']
};
 
// Cleans all gulp files
gulp.task('clean', () => {
  return del([paths.scripts[1], paths.images[1], 
                paths.css[1], paths.icon[1]]);
});
 
// Minify and copy all JavaScript (except vendor scripts) 
gulp.task('scripts', ['clean'], () => {
  return gulp.src(paths.scripts[0], {extension: '.js'})
    .pipe(sourcemaps.init())
      .pipe(changed(paths.scripts[1]))
      .pipe(babel({
        presets: ['es2015', 'react']
      }))
      .pipe(uglify())
      .pipe(concat('all.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scripts[1]));
});
 
// Copy all static images 
gulp.task('images', ['clean'], () => {
  return gulp.src(paths.images[0])
    .pipe(changed(paths.images[1]))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images[1]));
});

// Copy icon
gulp.task('icon', ['clean'], () => {
  return gulp.src(paths.icon[0], {extension: '.ico'})
    .pipe(changed(paths.icon[1]))
    .pipe(gulp.dest(paths.icon[1]));
});

// Pre-process CSS
gulp.task('css', ['clean'], () => {
  return gulp.src(paths.css[0])
    .pipe(changed(paths.css[1], {extension: '.css'}))
    .pipe(autoprefixer())
    .pipe(nano())
    .pipe(concat('style.css'))
    .pipe(gulp.dest(paths.css[1]))
})
 
gulp.on('stop', () => { process.exit(0); });
gulp.on('err', () => { process.exit(1); });
 
// The default task (run on server start)
gulp.task('default', Object.keys(paths));