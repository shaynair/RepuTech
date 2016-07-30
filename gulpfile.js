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
const cache = require('gulp-cache');

// CSS
const sass = require('gulp-sass');
const nano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');

// Clean
const del = require('del');
 
const paths = {
  scripts: ['assets/scripts/*.js', 'public/scripts'],
  images: ['assets/images/*', 'public/images'],
  css: ['assets/stylesheets/*', 'public/stylesheets'],
  icon: ['assets/favicon.ico', 'public/favicon.ico']
};
 
// Cleans all gulp files
gulp.task('clean', () => {
  return del([paths.scripts[1], paths.images[1], 
                paths.css[1], paths.icon[1]]);
});
 
// Minify and copy all JavaScript (except vendor scripts) 
gulp.task('scripts', ['clean'], () => {
  return gulp.src(paths.scripts[0])
    .pipe(sourcemaps.init())
      .pipe(changed(path.scripts[1]))
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(uglify())
      .pipe(concat('all.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.scripts[1]));
});
 
// Copy all static images 
gulp.task('images', ['clean'], () => {
  return gulp.src(paths.images[0])
    // Pass in options to the task 
    .pipe(changed(path.images[1]))
    .pipe(cache(imagemin({optimizationLevel: 5})))
    .pipe(gulp.dest(paths.images[1]));
});

// Copy icon
gulp.task('icon', ['clean'], () => {
  return gulp.src(paths.icon[0])
    .pipe(changed(path.images[1]))
    .pipe(gulp.dest(paths.icon[1]));
});

// Pre-process CSS
gulp.task('css', ['clean'], () => {
  return gulp.src(paths.css[0])
    .pipe(changed(path.css[1], {extension: '.css'}))
    .pipe(sourcemaps.init())
      .pipe(autoprefixer())
      .pipe(nano())
      .pipe(concat('style.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.css[1]))
})
 
// Rerun the task when a file changes 
gulp.task('watch', () => {
  gulp.watch(paths.scripts[0], ['scripts']);
  gulp.watch(paths.images[0], ['images']);
  gulp.watch(paths.css[0], ['css']);
});
 
// The default task (run on server start)
gulp.task('default', ['watch', 'scripts', 'images', 'css', 'icon']);