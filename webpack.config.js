const path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {

  entry: './src/_app.js',

  watchOptions: {
    poll: true
  },

  output: {
    path: path.join(__dirname, '/dist'),
    filename: `bundle${ process.env.NODE_ENV=='production' ? '.min' : '' }.js`,
    library: 'IRISTimelineViewer',
    libraryTarget: 'umd'
  },

  module: {

    rules: [
      {
        test: /\.js$/,
        include: [ path.resolve(__dirname, "src") ],
        use: [{ 
          loader: 'babel-loader' ,
          query: {
            presets: ['env']
          }
        }],
        
      },
      {
        test: /\.css$/,
        include: [ path.resolve(__dirname, "src"), path.resolve(__dirname, "node_modules/dc")  ],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader']
        })
      }
    ]
  },

  devServer: {
    host:         process.env.HOSTNAME || "localhost",
    port:         process.env.PORT || 8080,
    contentBase:  path.join(__dirname, '/dist')
  },

  devtool: "source-map",

  plugins: [  
    new HtmlWebpackPlugin({ template: "index.html", inject: "head" }),
    new ExtractTextPlugin(`style${ process.env.NODE_ENV=='production' ? '.min' : '' }.css`)
  ]

}