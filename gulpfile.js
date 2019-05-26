const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const rimraf = require('rimraf');
const p = require('gulp-load-plugins')();
const runSequence = require('run-sequence');
const reload = browserSync.reload;
const fs = require('fs');
const path = require('path');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');

const webpackConfig = require('./webpack.config');
const webpackConfigDev = require('./webpack.dev.config');

const input = 'src';
const output = 'public_html';

const sassSrc = [`${input}/**/*.scss`, `!${input}/**/_*.scss`];
const njkSrc = [`${input}/**/*.njk`, `!${input}/**/_*.njk`];

const plumberNotify = () => {
  return p.plumber({errorHandler: p.notify.onError("<%= error.message %>")});
};

const loadJsonSync = (filename) => {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
};

// clean
gulp.task('clean', (callback) => {
  rimraf(output, callback);
});

//nunjucks
gulp.task('njk', function(){
  return gulp.src(njkSrc)
    .pipe(p.using())
    .pipe(plumberNotify())
    .pipe(p.nunjucksRender({
      data: {
        root: path.resolve(__dirname, `./${input}`),
        vars: loadJsonSync('./site_conf.json')
      },
      path:`${input}/`
    }))
    .pipe(gulp.dest(output))
});

// 開発用Webpack
gulp.task('webpack:dev', () => {
  return webpackStream(webpackConfigDev, webpack)
    .on('error', function handleError() {
      // lintチェックでエラー吐いてもwatchが終了されないようにする
      this.emit('end');
    })
    .pipe(gulp.dest(webpackConfigDev.output.path));
});

// ビルド用Webpack
gulp.task('webpack:prod', () => {
  return webpackStream(webpackConfig, webpack)
    .on('error', function handleError() {
      this.emit('end');
    })
    .pipe(gulp.dest(webpackConfig.output.path));
});

// sassのコンパイル
gulp.task('sass', () => {
  return gulp.src(sassSrc, {
    base: input
  })
  .pipe(p.using())
  .pipe(plumberNotify())
  .pipe(p.sourcemaps.init())
  .pipe(p.sass({outputStyle: 'expanded'}).on('error', p.sass.logError))
  .pipe(p.autoprefixer({
    browsers: ['last 2 versions', 'ie 10-11', 'iOS >= 10', 'Android >= 5.0'],
    cascade: false
  }))
  .pipe(p.sourcemaps.write('./'))
  .pipe(gulp.dest(output));
});

// server
gulp.task('server', () => {
  browserSync.init({
    server: {
      baseDir: output,
      index: 'index.html'
    }
  });
});

// watch
gulp.task('watch', ['server'], () => {
  gulp.watch(`${input}/**/*.njk`, ['njk', reload]);
  gulp.watch(`${input}/**/*.js`, ['webpack:dev', reload]);
  gulp.watch(`${input}/**/*.scss`, ['sass', reload ]);
});

gulp.task('default', (callback) => {
  return runSequence(['njk', 'sass', 'webpack:dev'], 'watch', callback);
});

gulp.task('build', (callback) => {
  return runSequence('clean', ['njk', 'sass', 'webpack:prod'], callback);
});
