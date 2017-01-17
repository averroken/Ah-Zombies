var gulp = require("gulp"),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    cssLint = require('gulp-csslint'),
    jsHint = require('gulp-jshint'),
    jsStylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    pump = require('pump'),
    babel = require('gulp-babel'),
    debug = false;

const PATHS = {
    CSS: {
        SRC: './public/css/style.css',
        DEST: './public/css/'
    },
    JS: {
        SRC: './public/game/js/*.js',
        SRC_ES5: './public/game/js/es5/*.js',
        DEST: './public/game/js/min/',
        DEST_ES5: './public/game/js/es5/'
    }
};

const AUTOPREFIXOPTIONS = {
    browsers: ['last 2 versions']
};

gulp.task('default', function () {
    var cssWatcher = gulp.watch(PATHS.CSS.SRC, ['css']);
    cssWatcher.on('change', function (event) {
        console.log("File: " + event.path + " was " + event.type);
    });

    var jsWatcher = gulp.watch(PATHS.JS.SRC, ["js"]);
    jsWatcher.on('change', function (event) {
        console.log("File: " + event.path + " was " + event.type);
    });
});

gulp.task("css", function () {
    gulp.src(PATHS.CSS.SRC)
        .pipe(sourcemaps.init())
        .pipe(autoprefixer(AUTOPREFIXOPTIONS))
        .pipe(cssLint())
        .pipe(concat("style.min.css"))
        .pipe(cleanCSS({debug: true, compatibility: '*'}, function (details) {
            console.log(details.name + ": " + details.stats.originalSize);
            console.log(details.name + ": " + details.stats.minifiedSize);
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(PATHS.CSS.DEST));
});

gulp.task("js", function () {
    gulp.src(PATHS.JS.SRC_ES5)
    // .pipe(jsHint())
    // .pipe(jsHint.reporter(jsStylish))
        .pipe(sourcemaps.init())
        .pipe(uglify({
            output: { // http://lisperator.net/uglifyjs/codegen
                beautify: debug,
                comments: debug ? true : /^!|\b(copyright|license)\b|@(preserve|license|cc_on)\b/i,
            },
            compress: { // http://lisperator.net/uglifyjs/compress, http://davidwalsh.name/compress-uglify
                sequences: !debug,
                booleans: !debug,
                conditionals: !debug,
                hoist_funs: false,
                hoist_vars: debug,
                warnings: debug,
            },
            mangle: !debug,
            outSourceMap: true,
            basePath: PATHS.JS.SRC,
            sourceRoot: PATHS.JS.DEST
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(PATHS.JS.DEST))
        .pipe(notify({message: "js built"}));

});

// gulp.task('js2', function (cb) {
//     pump([
//         gulp.src(PATHS.JS.SRC_ES5),
//         concat('apflora_built.js'),
//         uglify(),
//         gulp.dest('./src'),
//         gulp.dest('./dist/src')
//     ], cb)
// });

gulp.task('es5', () => {
    return gulp.src(PATHS.JS.SRC)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(PATHS.JS.DEST_ES5));
});