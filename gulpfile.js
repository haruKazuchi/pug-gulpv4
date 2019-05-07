const { src, dest, parallel, series, watch } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
const browserSync  = require('browser-sync');
const autoprefixer = require('gulp-autoprefixer');

const CONF = {
  PUG : {
    SOURCE : 'src/pug/**/*.pug',
		OUTPUT : './public',
  },
	SASS : {
		SOURCE : 'src/css/**/*.scss',
		OUTPUT : './public/assets/css',
	},
	JS : {
		SOURCE : 'src/js/**/*.js',
		OUTPUT : './public/assets/js',
	},
	BROWSERSYNC : {
		DOCUMENT_ROOT : './public',
		INDEX : 'index.html',
		GHOSTMODE : {
			clicks : false,
			forms  : false,
			scroll : false,
		}
	}
};

function html() {
  return src([CONF.PUG.SOURCE, '!/src/pug/includes/'])
    .pipe(pug())
    .pipe(dest(CONF.PUG.OUTPUT))
}

function css() {
  return src(CONF.SASS.SOURCE)
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(minifyCSS())
    .pipe(dest(CONF.SASS.OUTPUT))
}

function js() {
  return src(CONF.JS.SOURCE, { sourcemaps: true })
    .pipe(concat('app.min.js'))
    .pipe(dest(CONF.JS.OUTPUT, { sourcemaps: true }))
}

const browserSyncOption = {
  port: 5000,
  server : {
    baseDir : CONF.BROWSERSYNC.DOCUMENT_ROOT,
    index : CONF.BROWSERSYNC.INDEX,
  },
  ghostMode : CONF.BROWSERSYNC.GHOSTMODE,
  reloadOnRestart: true,
};

function browsersync(done) {
  browserSync.init(browserSyncOption);
  done();
}

function watchFiles(done) {
  const browserReload = () => {
    browserSync.reload();
    done();
  };
  watch(CONF.PUG.SOURCE).on('change', series(html, browserReload));
  watch(CONF.SASS.SOURCE).on('change', series(css, browserReload));
  watch(CONF.JS.SOURCE).on('change', series(html, browserReload));
}


exports.js = js;
exports.css = css;
exports.html = html;
exports.default = series(parallel(html, css, js), series(browsersync, watchFiles));