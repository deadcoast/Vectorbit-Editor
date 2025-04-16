
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    // Entry point for the application
    entry: "./src/index.js",

    // Output configuration
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction
        ? "js/[name].[contenthash].js"
        : "js/[name].bundle.js",
      publicPath: "/", // For proper routing support
    },

    // Module rules for processing files
    module: {
      rules: [
        // JavaScript/JSX processing
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        // CSS/SCSS processing
        {
          test: /\.(css|scss|sass)$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
            "sass-loader",
          ],
        },
        // Image file processing
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/images/[hash][ext][query]",
          },
        },
        // Font file processing
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/fonts/[hash][ext][query]",
          },
        },
      ],
    },

    // Plugins for build enhancements
    plugins: [
      new CleanWebpackPlugin(), // Cleans up the output directory before each build
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        filename: "index.html",
        favicon: "./public/favicon.ico", // Support for favicon
      }),
      new MiniCssExtractPlugin({
        filename: isProduction
          ? "css/[name].[contenthash].css"
          : "css/[name].css",
      }),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(argv.mode),
      }),
    ],

    // Optimization configuration for production
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          parallel: true,
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },

    // Development server configuration
    devServer: {
      static: path.join(__dirname, "public"),
      compress: true,
      port: 3000,
      historyApiFallback: true, // Support for React Router
      hot: true, // Enable hot module replacement
      open: true, // Automatically open browser on start
    },

    // Resolve file extensions
    resolve: {
      extensions: [".js", ".jsx", ".json"], // Support for JS and JSX files
      alias: {
        "@components": path.resolve(__dirname, "src/components/"),
        "@utils": path.resolve(__dirname, "src/utils/"),
        "@assets": path.resolve(__dirname, "public/assets/"),
      },
    },

    // Source maps for easier debugging
    devtool: isProduction ? "source-map" : "inline-source-map",

    // Performance hints for large builds
    performance: {
      hints: isProduction ? "warning" : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
};
