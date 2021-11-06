const gulp = require("gulp");


gulp.task("build", async function () {
  await gulp
    .src("build/static/js/*chunk.js", { base: "./" })
    .pipe(gulp.dest("./", { overwrite: true }));

  await gulp
    .src("build/index.html", { base: "./" })
    .pipe(gulp.dest("./", { overwrite: true }));

  await gulp
    .src("build/static/css/*chunk.css", { base: "./" })
    .pipe(gulp.dest("./", { overwrite: true }));
  return;
});
