const clean = require('clean-webpack-plugin');
const htmlweb = require('html-webpack-plugin');
const path = require('path');

module.exports ={
  entry: './index.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'bin'),
    publicPath: '/bin'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpg|png)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              //emitFile: false,
              outputPath: 'img',
              name: '[hash].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new clean(['bin']),
    new htmlweb({
      title: 'Simple video chat'
    })
  ]

}
