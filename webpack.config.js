const path = require("path");

module.exports = {
  entry: "./src/assets/js/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "src/assets/js"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
  devtool: "source-map",
};
