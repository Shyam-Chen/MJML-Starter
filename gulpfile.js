const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const pipeIf = require('gulp-if');
const data = require('gulp-data');
const nunjucks = require('gulp-nunjucks');
const mjml = require('gulp-mjml');
const rename = require('gulp-rename');
const minimist = require('minimist');
const nunjucksEngine = require('nunjucks');
const mjmlEngine = require('mjml');
const browserSync = require('browser-sync');
const Yaml = require('js-yaml-import');

const options = minimist(process.argv.slice(2));
const server = browserSync.create();

const getDirectories = (source) => {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
};

function transpile(cb) {
  return (
    gulp
      .src(path.join(__dirname, `./src/${options.mod ? options.mod : '**/*'}/template.mjml`))
      .pipe(
        data((file) => {
          const yaml = new Yaml([
            path.join(__dirname, 'src'),
            ...getDirectories(path.join(__dirname, 'src')).map((dir) =>
              path.join(__dirname, `./src/${dir}`),
            ),
          ]);
          const dirpath = path.dirname(file.path).replace(__dirname, '');
          const yamlFile = yaml.read(path.join(__dirname, dirpath, 'environment.yaml'));
          let tplEnv = 'STATIC';
          return yamlFile[tplEnv];
        }),
      )
      .pipe(
        nunjucks.compile(
          {
            __IS_STATIC__: true,
            startMsoConditionalTag: '<!--[if mso | IE]><!-- -->',
            startMsoNegationConditionalTag: '<!--[if !mso]><!-- -->',
            endConditionalTag: '<!--<![endif]-->',
            startHideConditionalTag: '<!--[if mso | IE]>',
            endHideConditionalTag: '<![endif]-->',
          },
          {
            env: new nunjucksEngine.Environment(
              new nunjucksEngine.FileSystemLoader([
                path.join(__dirname, 'src'),
                ...getDirectories(path.join(__dirname, 'src')).map((dir) =>
                  path.join(__dirname, `./src/${dir}`),
                ),
              ]),
              { autoescape: false },
            ),
          },
        ),
      )
      .pipe(
        rename((path) => ({
          dirname: '',
          basename: options.mod ? options.mod : path.dirname,
          extname: '.mjml',
        })),
      )
      .pipe(gulp.dest(path.join(__dirname, './dist/mjml')))
      .pipe(mjml(mjmlEngine, { minify: true }))
      .pipe(gulp.dest(path.join(__dirname, './dist/html')))

      // Blade
      .pipe(
        pipeIf(
          options.blade,
          rename((path) => ({
            dirname: path.dirname,
            basename: path.basename,
            extname: '.blade.php',
          })),
        ),
      )
      .pipe(pipeIf(options.blade, gulp.dest('./dist/blade')))

      // StringTemplate
      .pipe(
        pipeIf(
          options.st,
          rename((path) => ({
            dirname: path.dirname,
            basename: path.basename,
            extname: '.st',
          })),
        ),
      )
      .pipe(pipeIf(options.st, gulp.dest('./dist/st')))

      // Razor
      .pipe(
        pipeIf(
          options.razor,
          rename((path) => ({
            dirname: path.dirname,
            basename: path.basename,
            extname: '.cshtml',
          })),
        ),
      )
      .pipe(pipeIf(options.razor, gulp.dest('./dist/razor')))

      // Embedded Ruby
      .pipe(
        pipeIf(
          options.erb,
          rename((path) => ({
            dirname: path.dirname,
            basename: path.basename,
            extname: '.html.erb',
          })),
        ),
      )
      .pipe(pipeIf(options.erb, gulp.dest('./dist/erb')))
  );
}

function watch(cb) {
  if (!options.build) {
    gulp.watch(['./src/**/*.mjml', './src/**/*.yaml'], gulp.series(transpile, reload));
  } else {
    cb();
  }
}

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({ server: { baseDir: './dist/html', directory: true } });
  done();
}

function move(cb) {
  return gulp
    .src(`./dist/${options.tpl}/${options.project}/**/*`)
    .pipe(gulp.dest(path.join(__dirname, options.to)));
}

exports.serve = gulp.parallel(gulp.series(transpile, serve), watch);
exports.build = transpile;
exports.move = move;
