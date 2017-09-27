var gulp = require("gulp"),
  clean = require("gulp-clean"),
  autoprefixer = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  browserSync = require('browser-sync').create(),
  plumber = require("gulp-plumber");


// Сервер
gulp.task('server', function() {
  browserSync.init({
    port: 9000,
    server: {
      baseDir: 'app'
    }
  });
});
// Компиляция sass, сборка стилей
gulp.task('sass', function() {
    return gulp.src('app/css/sass/main.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
          browsers: ['last 16 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/css/'));
});
gulp.task('js', function() {
    return gulp.src('app/js/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(gulp.dest('app/js/min'));
}); 
// Слежка
gulp.task('watch', function() {
  gulp.watch(['app/css/sass/*.scss'], function(event, cb) {
        gulp.start('sass');
  });
  gulp.watch(['app/js/*.js'], function(event, cb) {
        gulp.start('js');
  });
  gulp.watch([
    'app/*.html',
    'app/js/**/*.js',
    'app/css/**/*.css'
  ]).on('change', browserSync.reload);
});


// Задача по-умолчанию
gulp.task('default', ['server', 'watch']);
