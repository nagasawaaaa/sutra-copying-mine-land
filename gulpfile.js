const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const rimraf = require('rimraf');
const p = require('gulp-load-plugins')();
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
  return rimraf(output, callback);
});

//nunjucks
gulp.task('njk', () => {
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
  return browserSync.init({
    server: {
      baseDir: output,
      index: 'index.html'
    }
  });
});

function browsersync(done) {
  browserSync.init({
    server: {
      baseDir: output,
      index: 'index.html'
    }
  });
  done();
}

function watchFiles (done) {
  const browserReload = () => {
    reload();
    done();
  };
  gulp.watch([`${input}/**/*.njk`]).on('change', gulp.series('njk', browserReload));
  gulp.watch([`${input}/**/*.js`]).on('change', gulp.series('webpack:dev', browserReload));
  gulp.watch([`${input}/**/*.scss`]).on('change', gulp.series('sass', browserReload));
}


gulp.task('default', gulp.series(
  gulp.parallel('njk', 'sass', 'webpack:dev'),
  gulp.series(browsersync, watchFiles)
));

gulp.task('build', gulp.series('clean',
  gulp.parallel('njk', 'sass', 'webpack:prod')
));
