import path from "path";
import fs from "fs";
import glob from "fast-glob";
import tinify from "tinify";
import gulp from "gulp";
const { dest, parallel, series, src, watch } = gulp;
import browsersync from "browser-sync";
import { deleteAsync } from "del";
import sourcemaps from "gulp-sourcemaps";
import notify from "gulp-notify";
import autoPrefixer from "gulp-autoprefixer";
import rename from "gulp-rename";
import uglify from "gulp-uglify";
import dotenv from "dotenv";

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

// SVG-SPRITE
import svgmin from "gulp-svgmin";
import cheerio from "gulp-cheerio";
import svgstore from "gulp-svgstore";

const paths = {
  dev: {
    root: "app",
    sass: "app/sass",
    css: "app/css",
    js: "app/js",
    pug: "app/pug",
    img: "app/img",
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

tinify.key = dotenv.config().parsed.TINYPNG_API_KEY;

const imagesPath = `${paths.dev.img}/**/*.{png,jpg,jpeg,webp}`;

const compressImages = async (done) => {
  try {
    const files = await glob(imagesPath.replace(/\\/g, "/"));

    for (const file of files) {
      const source = tinify.fromFile(file);
      await source.toFile(file);
      console.log(`✅ Compressed: ${file}`);
    }

    done();
  } catch (error) {
    notify.onError({
      title: "Tinify Compression Error",
      message: error.message,
      sound: false,
    })(error);

    done(error);
  }
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

const svgSprite = () => {
  return src(`${paths.dev.img}/svg-sprite/*.svg`)
    .pipe(
      svgmin(function (file) {
        let prefix = path.basename(file.relative, path.extname(file.relative));
        return {
          plugins: [
            {
              cleanupIDs: {
                prefix: prefix + "-",
                minify: true,
              },
            },
          ],
        };
      })
    )
    .pipe(
      cheerio({
        run: function ($) {
          $("[fill]").removeAttr("fill");
          $("[fill-opacity]").removeAttr("fill-opacity");
          $("[stroke]").removeAttr("stroke");
          $("[style]").removeAttr("style");
          $("[data-name]").removeAttr("data-name");
        },
        parserOptions: { xmlMode: true },
      })
    )
    .pipe(svgstore())
    .pipe(dest(`${paths.dev.img}/`));
};

const buildCopy = () => {
  return src(
    [
      `${paths.dev.css}/main.min.css`,
      `${paths.dev.js}/*.{js,json}`,
      `!${paths.dev.js}/main.js`,
      `${paths.dev.js}/main.bundle.js`,
      `${paths.dev.img}/**/*`,
      `${paths.dev.root}/*.html`,
    ],
    {
      base: `${paths.dev.root}/`,
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
  watch(`${paths.dev.img}/svg-sprite/*.svg`, { usePolling: true }, svgSprite);
};

export const compress = series(compressImages);
export const build = series(cleanBuild, minJs, css, html, buildCopy, svgSprite);
export default series(js, css, html, svgSprite, parallel(browserSync, startWatch));
