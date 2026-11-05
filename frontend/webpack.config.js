const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env = {}) => {
  // webpack-cli: `--env wireframe` → env === "wireframe"; `--env wireframe=true` → { wireframe: "true" }
  const wireframe =
    env === "wireframe" ||
    env?.wireframe === true ||
    env?.wireframe === "true";

  return {
    entry: "./src/index.tsx",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
      clean: true,
      publicPath: "/"
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        title: wireframe ? "Школьная столовая — вайрфрейм" : "Школьная столовая"
      }),
      new webpack.DefinePlugin({
        "process.env.WIREFRAME_MODE": JSON.stringify(wireframe ? "true" : "false")
      })
    ],
    devServer: {
      port: 3000,
      historyApiFallback: true
    }
  };
};
