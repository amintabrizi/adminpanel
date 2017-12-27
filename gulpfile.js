var gulp = require('gulp');
var sass = require('gulp-sass');
var useref = require('gulp-useref');
// Other requires...
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');
var plumberNotifier = require('gulp-plumber-notifier');
var stylelint = require('stylelint');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');

var postcss = require('gulp-postcss');
var precss = require('precss');
var cssnext = require('postcss-cssnext');
var rucksack = require('rucksack-css');
var vmin = require('postcss-vmin');
var emMediaquery= require('postcss-em-media-query');
var mqpacker = require('css-mqpacker');
var doiuse = require('doiuse');
var reporter = require('postcss-reporter');

var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var path = require('path');
var rename = require('gulp-rename');

var plugins = [
  precss,
  cssnext({
    browsers: ['last 3 versions', 'IE >= 9'],
    features: {
      rem: {
        atrules: true
      }
    }
  }),
  vmin,
  emMediaquery,
  mqpacker({
    sort: true
  }),
  rucksack(),
  reporter({
    clearMessages: true
  })
];

var lintPlugins = [
  stylelint,
  doiuse({
    browsers: ['last 3 versions', 'IE >= 9']
  }),
  reporter({
    clearMessages: true
  })
];

gulp.task('sass', function() {
  return gulp.src(['app/scss/app.scss' ,'app/scss/selfstyle/style.scss'])
    .pipe(plumberNotifier())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss(plugins))
    .pipe(concat('style.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('svgstore', function () {
    return gulp
        .src('app/svg/*.svg')
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(rename(function (file) {
            var name = file.dirname.split(path.sep);
            name.push(file.basename);

        }))
        .pipe(svgstore())
        .pipe(gulp.dest('app/svg-sprite'));
});

gulp.task('svgstore-build', function () {
    return gulp
        .src('app/svg/*.svg')
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(rename(function (file) {
            var name = file.dirname.split(path.sep);
            name.push(file.basename);

        }))
        .pipe(svgstore())
        .pipe(gulp.dest('dist/svg-sprite'));
});



gulp.task('svgstore-ajax', function () {
    return gulp
        .src('app/svg-ajax/*.svg')
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(rename(function (file) {
            var name = file.dirname.split(path.sep);
            name.push(file.basename);

        }))
        .pipe(svgstore())
        .pipe(gulp.dest('app/svg-sprite-ajax'));
});


gulp.task('svgstore-ajax-build', function () {
    return gulp
        .src('app/svg-ajax/*.svg')
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(rename(function (file) {
            var name = file.dirname.split(path.sep);
            name.push(file.basename);

        }))
        .pipe(svgstore())
        .pipe(gulp.dest('dist/svg-sprite-ajax'));
});

gulp.task('lint', function() {
  return gulp.src('app1/scss/**/*.scss')
    .pipe(plumberNotifier())
    .pipe(postcss(lintPlugins))
});


gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
})



gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch('app/scss/**/*.scss', ['sass']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});


gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});




gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest('dist/images'))
});


gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
})



gulp.task('clean:dist', function() {
  return del.sync('dist');
})



gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['sass', 'useref', 'images', 'fonts','svgstore-build','svgstore-ajax-build'],
    callback
  )
})



gulp.task('default', function (callback) {
  runSequence(['sass','browserSync', 'watch','lint','svgstore','svgstore-ajax'],
    callback
  )
})
