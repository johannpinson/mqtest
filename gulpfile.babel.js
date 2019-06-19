import del from 'del'
import path from 'path'
import gulp from 'gulp'
import gulpLoadPlugins from 'gulp-load-plugins'
import through2 from 'through2'
import parseArgs from 'minimist'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import tildeImporter from 'node-sass-tilde-importer'
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import tsify from 'tsify'
import buffer from 'vinyl-buffer'
import { name, author, version } from './package.json'

const appDir = 'app'
const destDir = 'build'

const paths = {
  styles: {
    src: `${appDir}/styles/index.scss`,
    watch: `${appDir}/styles/**/*.scss`,
    dest: `${destDir}/assets`,
    options: {
      importer: tildeImporter,
    },
  },
  scripts: {
    src: `${appDir}/scripts/index.ts`,
    srcVendors: [
      // 'node_modules/intersection-ob/intersection-observer.js',
    ],
    watch: `${appDir}/scripts/**/*.ts`,
    dest: `${destDir}/assets`,
  },
  sprite: {
    src: `${appDir}/assets/icons/*.svg`,
    dest: `${destDir}/assets`,
  },
  content: {
    data: `${appDir}/assets/data/**/*`,
    fonts: `${appDir}/assets/fonts/*`,
    medias: `${appDir}/assets/medias/**/*.{jpg,png,gif,svg,mp4}`,
  },
  views: {
    src: `${appDir}/views/**/*`,
    dest: destDir,
  },
}

const banner = `/*!
 * ${name}
 * @author: ${author}
 * @date: ${new Date().getFullYear()}
 * @copyright: All rights reserved, ${new Date().getFullYear()} ${author}
 * v${version}
 */
`

const plugins = gulpLoadPlugins()
const noop = () => through2.obj()
const env = parseArgs(process.argv.slice(2))

function errorHandler(err) {
  plugins.notify.onError('JS Error: <%= error.message %>')(err)
  this.emit('end'); // End function
}

export const clean = () => del([`${destDir}/*`])

export const copy = () => gulp
  .src([
    // paths.content.data,
    paths.content.fonts,
    paths.content.medias,
  ], { base: `${appDir}/assets` })
  .pipe(gulp.dest(`${destDir}/assets`))

export const views = () => gulp
  .src(paths.views.src)
  .pipe(gulp.dest(paths.views.dest))

export const styles = () => gulp
  .src(paths.styles.src)
  .pipe(plugins.plumber({
    errorHandler: (error) => {
      plugins.notify.onError('CSS Error: <%= error.message %>')(error)
    },
  }))
  .pipe(env.production ? noop() : plugins.sourcemaps.init())
  .pipe(plugins.sass(paths.styles.options))
  .pipe(env.production ? noop() : plugins.sourcemaps.write())
  .pipe(plugins.postcss([autoprefixer]))
  .pipe(env.production
    ? plugins.postcss([cssnano({
      reduceIdents: {
        keyframes: false,
      },
      discardUnused: {
        keyframes: false,
      },
    })])
    : noop())
  .pipe(env.production ? plugins.header(banner) : noop())
  // .pipe(env.production ? plugins.hash({ template: '<%= hash %><%= ext %>' }) : noop())
  .pipe(gulp.dest(paths.styles.dest))

// export const scripts = () => gulp
//   .src(paths.scripts.src)
//   .pipe(plugins.plumber({
//     errorHandler: (error) => {
//       plugins.notify.onError('JS Error: <%= error.message %>')(error)
//     },
//   }))
//   .pipe(env.production ? noop() : plugins.sourcemaps.init())
//   .pipe(plugins.babel())
//   .pipe(env.production ? noop() : plugins.sourcemaps.write())
//   .pipe(env.production ? plugins.uglify() : noop())
//   .pipe(env.production ? plugins.header(banner) : noop())
//   .pipe(env.production ? plugins.hash({ template: 'index.<%= hash %><%= ext %>' }) : noop())
//   .pipe(gulp.dest(paths.scripts.dest))

export const scripts = () => browserify({
  basedir: '.',
  debug: false,
  entries: [paths.scripts.src],
  cache: {},
  packageCache: {},
}).plugin(tsify)
  .transform('babelify', {
    presets: ['@babel/preset-env'],
    extensions: ['.ts'],
  })
  .bundle()
  .on('error', errorHandler)
  .pipe(plugins.plumber({
    errorHandler: (error) => {
      plugins.notify.onError('JS Error: <%= error.message %>')(error)
    },
  }))
  .pipe(source('index.js'))
  .pipe(buffer())
  .pipe(env.production ? noop() : plugins.sourcemaps.init())
  .pipe(env.production ? plugins.uglify() : noop())
  .pipe(env.production ? noop() : plugins.sourcemaps.write())
  .pipe(env.production ? plugins.header(banner) : noop())
  // .pipe(env.production ? plugins.hash({ template: 'index.<%= hash %><%= ext %>' }) : noop())
  .pipe(gulp.dest(paths.scripts.dest))

export const vendors = () => gulp
  .src(paths.scripts.srcVendors)
  .pipe(plugins.concat('vendors.js'))
  .pipe(plugins.plumber({
    errorHandler: (error) => {
      plugins.notify.onError('JS Error: <%= error.message %>')(error)
    },
  }))
  .pipe(env.production ? noop() : plugins.sourcemaps.init())
  .pipe(env.production ? plugins.uglify() : noop())
  .pipe(env.production ? noop() : plugins.sourcemaps.write())
  .pipe(env.production ? plugins.header(banner) : noop())
  .pipe(env.production ? plugins.hash({ template: 'vendors.<%= hash %><%= ext %>' }) : noop())
  .pipe(gulp.dest(paths.scripts.dest))

export const sprite = () => gulp
  .src(paths.sprite.src)
  .pipe(plugins.plumber())
  .pipe(plugins.svgmin((file) => {
    const prefix = path.basename(file.relative, path.extname(file.relative))
    return {
      plugins: [{
        cleanupIDs: {
          prefix: `${prefix}-`,
          minify: true,
        },
      }],
    }
  }))
  .pipe(plugins.svgstore({ inlineSvg: true }))
  .pipe(plugins.cheerio(($) => {
    $('svg')
      .attr('viewBox', '0 0 200 200')
      .prepend(
        `
<defs><style>.img:target{display:inline}.img{display:none}</style></defs>
`,
      )

    Array.prototype.forEach.call($('symbol'), (el) => {
      const $node = $(el);
      const symbol = $(el).clone();
      el.tagName = 'svg'; // eslint-disable-line no-param-reassign
      $node
        .html(
          `${$(symbol).clone().append()}
<g id="bg-${$node.attr('id')}" class="img">${$node.html()}</g>`,
        )
        .removeAttr('id')
    });
  }))
  .pipe(gulp.dest(paths.sprite.dest))

export const watch = () => {
  gulp.watch(paths.styles.watch, styles)
  gulp.watch(paths.sprite.src, sprite)
  gulp.watch(paths.scripts.watch, scripts)
  // gulp.watch(paths.scripts.srcVendors, scripts)
  gulp.watch(paths.views.src, views)
  gulp.watch([
    // paths.content.data,
    paths.content.fonts,
    paths.content.medias,
  ], copy)
}

export const build = gulp.series(
  clean,
  copy,
  sprite,
  views,
  styles,
  gulp.parallel([scripts]),
  // gulp.parallel([scripts, vendors]),
)

export const run = gulp.series(build, watch)

export default run
