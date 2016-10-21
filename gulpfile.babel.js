let gulp = require('gulp');
let sass = require('gulp-sass');
let sourcemaps = require('gulp-sourcemaps');
let postcss = require('gulp-postcss');
let cssnext = require('postcss-cssnext');
let sorting = require('postcss-sorting');
let browserify = require('browserify');
let babelify = require('babelify');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');
let htmlmin = require('gulp-htmlmin');
let minifyCss = require('gulp-minify-css');
let uglify = require('gulp-uglify');
let imagemin = require('gulp-imagemin');
let copy = require('gulp-copy');
let clean = require('gulp-clean');
let sequence = require('gulp-sequence');
let zip = require('gulp-zip');
let watchify = require('watchify');
let exit = require('gulp-exit');
let notify = require('gulp-notify');
let browserSync = require('browser-sync');
let glob = require('glob');
let path = require('path');
let vueify = require('vueify');
let aliasify = require('aliasify');


const reload = browserSync.reload;
const browserifyObjectArray = [];


const devFolder = 'dev';
const destFolder = 'dist';

const styleFolder = 'style';
const scriptFolder = 'script';
const imageFolder = 'image';
const componentFolder = 'component';
const vuexFolder = 'vuex';

const archiveFile = 'archive.zip';


const devPath = {
    html: path.join(devFolder, '*.html'),
    sass: path.join(devFolder, styleFolder, '**', '*.{scss,sass}'),
    js: path.join(devFolder, scriptFolder, '*.js'),
    img: path.join(devFolder, imageFolder, '**', '*'),
};

const destPath = {
    root: path.join(destFolder),
    css: path.join(destFolder, styleFolder, '**', '*.css'),
    js: path.join(destFolder, scriptFolder, '**', '*.js'),
    cssDir: path.join(destFolder, styleFolder),
    jsDir: path.join(destFolder, scriptFolder),
    imgDir: path.join(destFolder, imageFolder),
};

const util = {
    cleanSource: [destFolder, archiveFile],
    copySource: [
        path.join(devFolder, '**', '*'),
        '!' + path.join(devFolder, '*.html'),
        '!' + path.join(devFolder, styleFolder, '**', '*'),
        '!' + path.join(devFolder, scriptFolder, '**', '*'),
        '!' + path.join(devFolder, imageFolder, '**', '*'),
    ],
    archiveFile: archiveFile,
    compressFile:  path.join(destFolder, '**'),
    compressDir: '.' + path.sep,
    browserSyncDir: [destFolder, devFolder],
    devReloadSource: [
        path.join(devFolder, '**', '*'),
        '!' + path.join(devFolder, vuexFolder, '**', '*'),
        '!' + path.join(devFolder, componentFolder, '**', '*'),
        '!' + path.join(devFolder, styleFolder, '**', '*'),
        '!' + path.join(devFolder, scriptFolder, '**', '*'),
    ],
};

glob(devPath.js, (err, files) => {
    files.forEach((file) => {
        let name = path.basename(file);

        let instance = browserify({
            entries: [file],
            cache: {},
            packageCache: {},
            fullPaths: true,
            plugin: [watchify],
        })
        .transform(vueify)
        .transform(babelify, {
            presets: ['es2015']
        })
        .transform(aliasify, {
            aliases: {
                vue: 'vue/dist/vue.js'
            },
            verbose: false
        });

        browserifyObjectArray.push({
            name: name,
            instance: instance,
            processor: () => {
                return instance
                .bundle()
                .on('error', (err) => {
                    console.log(err.toString());
                    this.emit('end');
                })
                .pipe(source(name))
                .pipe(buffer())
                .pipe(gulp.dest(destPath.jsDir))
                .pipe(reload({stream: true}));
            }
        });
    });
});

function bundleJs(){
    browserifyObjectArray.forEach((obj) => {
        return obj.processor();
    });
}

gulp.task('sass', () => {
    return gulp.src(devPath.sass)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
        cssnext(),
        sorting(),
    ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(destPath.cssDir))
    .pipe(reload({stream: true}));
});

gulp.task('browserify', bundleJs);

gulp.task('minify-html', () => {
    return gulp.src(devPath.html)
    .pipe(htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
    }))
    .pipe(gulp.dest(destPath.root));
});

gulp.task('minify-css', () => {
    return gulp.src(destPath.css)
    .pipe(minifyCss())
    .pipe(gulp.dest(destPath.cssDir));
});

gulp.task('minify-js', () => {
    return gulp.src(destPath.js)
    .pipe(uglify())
    .pipe(gulp.dest(destPath.jsDir));
});

gulp.task('img', () => {
    return gulp.src(devPath.img)
    .pipe(imagemin())
    .pipe(gulp.dest(destPath.imgDir));
});

gulp.task('clean', () => {
    return gulp.src(util.cleanSource)
    .pipe(clean());
});

gulp.task('copy', () => {
    return gulp.src(util.copySource)
    .pipe(copy(destPath.root, {
        prefix: 1
    }));
});

gulp.task('compress', () => {
    return gulp.src(util.compressFile)
    .pipe(zip(util.archiveFile))
    .pipe(gulp.dest(util.compressDir));
});

gulp.task('complete', () => {
    gulp.src('')
    .pipe(notify({
        message: 'build complete',
    }))
    .pipe(exit());
});

gulp.task('compile', (cb) => {
    sequence('clean', ['browserify', 'sass'], cb);
});

gulp.task('default', ['compile'], () => {
    browserSync.init({
        port: 9000,
        server: {
            baseDir: util.browserSyncDir,
        },
    });

    gulp.watch(devPath.sass, ['sass']);

    browserifyObjectArray.forEach((obj) => {
        obj.instance.on('update', obj.processor);
    });

    gulp.watch(util.devReloadSource).on('change', reload);
});

gulp.task('build', (cb) => {
    sequence('compile', ['minify-html', 'minify-css', 'minify-js', 'img'], 'copy', 'compress', 'complete', cb);
});
