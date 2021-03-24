import * as webpack from 'webpack';
import * as path from 'path';
import * as DtsBundleWebpack from 'dts-bundle-webpack';
import * as tsTransformPaths from '@zerollup/ts-transform-paths';

const config: webpack.Configuration = {
  mode: 'production',
  target: 'node',
  entry: {
    extensions: './src/extensions/index.ts',
    webpack: './src/webpack/ConsoleRemotePlugin.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist/lib'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          onlyCompileBundledFiles: true,
          getCustomTransformers: (program) => ({
            afterDeclarations: [tsTransformPaths(program).afterDeclarations]
          }),
        },
      },
    ],
  },
  plugins: [
    new DtsBundleWebpack({
      name: 'extensions',
      main: 'dist/declarations/console-dynamic-plugin-sdk/src/extensions/index.d.ts',
      out: '../../../../lib/extensions.d.ts',
      outputAsModuleFolder: true,
      removeSource: true,
    }),
    new DtsBundleWebpack({
      name: 'webpack',
      main: 'dist/declarations/console-dynamic-plugin-sdk/src/webpack/ConsoleRemotePlugin.d.ts',
      out: '../../../../lib/webpack.d.ts',
      outputAsModuleFolder: true,
      removeSource: true,
    }),
  ],
  externals: [
    {
      webpack: 'commonjs2 webpack',
      pnpapi: 'commonjs2 pnpapi',
      'spdx-exceptions': 'commonjs2 spdx-exceptions',
      'spdx-license-ids': 'commonjs2 spdx-license-ids',
      'spdx-license-ids/deprecated': 'commonjs spdx-license-ids/deprecated',
    },
  ],
};

export default config;
