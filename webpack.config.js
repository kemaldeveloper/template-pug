import TerserPlugin from 'terser-webpack-plugin';

export const getWebpackConfig = (options = {}) => {
  const webpackConfig = {
    mode: options.mode || 'development',
    entry: {
      main: './app/js/main.js',
    },
    output: {
      filename: '[name].bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-class-properties'],
            },
          },
        },
      ],
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
      ],
    },
    plugins: [],
  };

  return webpackConfig;
};
