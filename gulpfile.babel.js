import gulp from "gulp";
import babel from "gulp-babel";
import postcss from "gulp-postcss";
import gulpSass from "gulp-sass";
import sass from "sass";
import cssnano from "cssnano";
import autoprefixer from "gulp-autoprefixer";
import replace from "gulp-replace";
import htmlmin from "gulp-htmlmin";
import terser from "gulp-terser";
import imagemin from "gulp-imagemin";
import webp from "gulp-webp";
import webphtml from "gulp-webp-html";
import webpcss from "gulp-webp-css";
import svgSprite from "gulp-svg-sprite";
import sync from "browser-sync";
import del from "del";
const scss = gulpSass(sass);

// HTML
export const html = () => {
  return gulp
    .src("src/*.html")
    .pipe(webphtml())
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("dist"))
    .pipe(sync.stream());
};

// Styles
export const styles = () => {
  return gulp
    .src("src/styles/style.scss")
    .pipe(scss())
    .pipe(postcss([cssnano()]))
    .pipe(replace(/\.\.\//g, ""))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true,
        grid: true,
      })
    )
    .pipe(webpcss())
    .pipe(gulp.dest("dist"))
    .pipe(sync.stream());
};

// Scripts
export const scripts = () => {
  return gulp
    .src("src/js/index.js")
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(terser())
    .pipe(gulp.dest("dist"))
    .pipe(sync.stream());
};

// Images
export const images = () => {
  return gulp
    .src(["src/images/**/*"], {
      base: "src",
    })
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(gulp.dest("dist"))
    .pipe(
      gulp.src(["src/images/**/*"], {
        base: "src",
      })
    )
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3,
      })
    )
    .pipe(gulp.dest("dist"))
    .pipe(
      sync.stream({
        once: true,
      })
    );
};

export const svg = () => {
  return gulp
    .src("src/images/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(gulp.dest("dist"));
};

// Paths
export const paths = () => {
  return gulp
    .src("dist/*.html")
    .pipe(
      replace(/(<link rel="stylesheet" href=")styles\/(style.css">)/, "$1$2")
    )
    .pipe(replace(/(<script src=")js\/(index.js">)/, "$1$2"))
    .pipe(gulp.dest("dist"));
};

// Server
export const server = () => {
  sync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: "dist",
    },
  });
};

// Watch
export const watch = () => {
  gulp.watch("src/*.html", gulp.series(html, paths));
  gulp.watch("src/styles/**/*.scss", gulp.series(styles));
  gulp.watch("src/js/**/*.js", gulp.series(scripts));
  gulp.watch("src/images/**/*", gulp.series(images));
};

export const clean = () => {
  return del("dist");
};

// Default
export default gulp.series(
  clean,
  gulp.parallel(html, styles, scripts, images),
  paths,
  gulp.parallel(watch, server)
);
