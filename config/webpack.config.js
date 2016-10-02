const { appRoot, moduleRoot, appPath, modulePath } = require('./paths')
const babelConfig = require('./babel')
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WebpackErrorNotification = require('webpack-error-notification');

const webpackErrorNotificationPlugin = process.env.NODE_ENV === 'development' ?
  new WebpackErrorNotification() :
  new webpack.DefinePlugin({})
;

const processDotEnvPlugin = new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'process.env.PORT':     JSON.stringify(process.env.PORT),
})

module.exports = {
  context: appPath('browser'),
  entry: [
    modulePath('config/polyfills.js'),
    appPath('browser/index.js')
  ],
  output: {
    path: appPath('build/public'),
    pathinfo: true,
    filename: "browser.js",
    publicPath: '/'
  },
  resolve: {
    alias: {
      lib: appPath('lib'),
      react: require.resolve('react'),
      "react-dom": path.resolve(require.resolve('react'), '../lib/ReactDOM'),
    },
    root: [
      appPath('server'),
      appPath('lib')
    ]
  },
  devtool: 'sourcemap',
  postcss: function() {
    return [
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9', // React doesn't support IE8 anyway
        ]
      }),
    ];
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        include: [
          appPath('browser'),
          appPath('lib')
        ],
        loader: 'babel',
        query: babelConfig
      },
      {
        test: /\.css$/,
        loader: 'style!css!postcss'
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        exclude: /\/favicon.ico$/,
        loader: 'file',
        query: {
          name: '[name].[ext]'
        }
      },
      // A special case for favicon.ico to place it into build root directory.
      {
        test: /\/favicon.ico$/,
        include: [appPath('browser')],
        loader: 'file',
        query: {
          name: 'favicon.ico?'
        }
      },
      // "url" loader works just like "file" loader but it also embeds
      // assets smaller than specified size as data URLs to avoid requests.
      {
        test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: 'static/[name].[ext]'
        }
      },
      {
        test: /\.sass$/,
        loader: ExtractTextPlugin.extract("style", "css!sass?sourceMap")
      },
      {
        test: /\.html$/,
        loader: 'html',
        query: {
          attrs: ['link:href'],
        }
      }
    ]
  },
  plugins: [
    webpackErrorNotificationPlugin,
    new HtmlWebpackPlugin({
      inject: true,
      template: appPath('browser/index.html'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    processDotEnvPlugin,
    // This helps ensure the builds are consistent if source hasn't changed:
    new webpack.optimize.OccurrenceOrderPlugin(),
    // Try to dedupe duplicated modules, if any:
    new webpack.optimize.DedupePlugin(),
    new ExtractTextPlugin('browser.css')
  ]
};


































