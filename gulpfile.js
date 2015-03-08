var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('gulp-browserify');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');

gulp.task('compile:css', function() {
  return gulp.src('./src/scss/*.scss')
    .pipe(sass()) 
    .pipe(autoprefixer({
      browsers: ['last 2 versions'], // TODO: may need to change this for compatibility
      remove: false
    }))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('compile:js', function() {
  return gulp.src('./src/js/*.js')
    .pipe(browserify({
      debug: true,
      insertGlobals: true,
      transform: ['famousify', 'cssify', 'brfs']
    }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.reload({ stream: true }));
});

// Static server
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
});

gulp.task('watch', ['browser-sync'], function() {
  gulp.watch('src/js/*.js', ['compile:js', browserSync.reload]);
  gulp.watch('src/scss/*.scss', ['compile:css', browserSync.reload]);
});

gulp.task('default', ['compile:js', 'compile:css', 'browser-sync', 'watch']);
