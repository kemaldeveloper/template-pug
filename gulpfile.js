import gulp from "gulp";
const { dest, parallel, series, src, watch } = gulp;
import browsersync from "browser-sync";
import { deleteAsync } from "del";
import sourcemaps from "gulp-sourcemaps";
import notify from "gulp-notify";
import autoPrefixer from "gulp-autoprefixer";
import rename from "gulp-rename";
import uglify from "gulp-uglify";

// PUG
import plumber from "gulp-plumber";
import prettyHtml from "gulp-pretty-html";
import pug from "gulp-pug";
import pugbem from "gulp-pugbem";

// Webpack JS
import webpackStream from "webpack-stream";
import webpack from "webpack";
import { getWebpackConfig } from "./webpack.config.js";

// CSS
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import cleancss from "gulp-clean-css";
const sass = gulpSass(dartSass);

const paths = {
  dev: {
    root: "app",
    sass: "app/sass",
    css: "app/css",
    js: "app/js",
    pug: "app/pug",
  },
  build: {
    root: "build",
  },
};

const js = () => {
  return src(`${paths.dev.js}/**/*.js`)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(webpackStream(getWebpackConfig({ mode: "development" }), webpack))
    .on("error", function (error) {
      notify.onError()(error);
      this.emit("end");
    })
    .pipe(dest(`${paths.dev.js}/`))
    .pipe(browsersync.stream());
};

const minJs = () => {
  return src(`${paths.dev.js}/**/*.js`)
    .pipe(webpackStream(getWebpackConfig({ mode: "production" }), webpack))
    .on("error", function (error) {
      notify.onError()(error);
      this.emit("end");
    })
    .pipe(uglify())
    .pipe(dest(`./${paths.dev.js}/`));
};

const css = () => {
  return src(`${paths.dev.sass}/main.sass`)
    .pipe(sourcemaps.init())
    .pipe(
      sass.sync().on("error", function (error) {
        notify.onError({})(error);
        this.emit("end");
      })
    )
    .pipe(autoPrefixer(["last 10 versions"]))
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(sourcemaps.write())
    .pipe(dest(`${paths.dev.css}`))
    .pipe(browsersync.stream());
};

pugbem.b = true;

const html = () => {
  return src(`${paths.dev.pug}/pages/*.pug`)
    .pipe(plumber({ errorHandler: notify.onError() }))
    .pipe(pug({ plugins: [pugbem] }))
    .pipe(
      prettyHtml({
        indent_size: 2,
        indent_with_tabs: true,
        unformatted: ["code", "pre", "em", "strong", "span", "i", "b", "br"],
        extra_liners: [],
        indent_char: [" "],
      })
    )
    .pipe(dest(`${paths.dev.root}`))
    .pipe(browsersync.stream());
};

const browserSync = () => {
  browsersync.init({
    server: {
      baseDir: paths.dev.root,
    },
    notify: false,
    open: false,
  });
};

// FIXME: убрать отсюда allowEmpty найти ошибку
const buildCopy = () => {
  return src(
    [
      `${paths.dev.css}/main.min.css`,
      `${paths.dev.js}/*.{js,json}`,
      `!${paths.dev.js}/main.js`,
      `${paths.dev.js}/main.bundle.js`,
      `${paths.dev.root}/*.html`,
    ],
    {
      base: `${paths.dev.root}/`,
      allowEmpty: true,
    }
  ).pipe(dest(`${paths.build.root}/`));
};

async function cleanBuild() {
  await deleteAsync(`${paths.build.root}/**/*`, { force: true });
}

const startWatch = () => {
  watch([`${paths.dev.sass}/**/*.sass`, `!${paths.dev.sass}/libs/libs.sass`], { usePolling: true }, css);
  watch(`${paths.dev.pug}/**/*.pug`, { usePolling: true }, html);
  watch(
    [`${paths.dev.js}/main.js`, `${paths.dev.js}/modules/*.js`, `${paths.dev.js}/helpers/*.js`],
    { usePolling: true },
    js
  );
};

export const build = series(cleanBuild, minJs, css, html, buildCopy);
export default series(js, css, html, parallel(browserSync, startWatch));
