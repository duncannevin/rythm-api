const merge = require('webpack-merge');
const common = require('./webpack.common');
const webpack = require('webpack');

module.exports = merge(common, {
  entry: [ 'webpack/hot/poll?100' ],
  mode: 'development',
  watch: true,
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
});