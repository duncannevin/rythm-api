const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  // app entry
  entry: [ './src/app.ts' ],
  // target
  target: 'node',
  // prevent ts warnings
  externals: [
    nodeExternals({
      whitelist: [ 'webpack/hot/poll?100' ]
    })
  ],
  module: {
    rules: [
      {
        test: /tsx?$/,
        use: 'ts-loader',
        exclude: [
          /node_modules/,
          /test/,
          /dist/,
          /static/
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin()
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js'
  }
};
