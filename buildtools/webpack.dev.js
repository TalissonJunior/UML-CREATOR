const path = require('path');
const merge = require('webpack-merge');
const common = require('../webpack.config.js');
const CopyPlugin = require('copy-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = merge(common, {
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                loader: 'babel-loader'
            },
            {
                test: /\.tsx?$/,
                loader: [ 'ts-loader'],
            },
            {
				test: /\.scss$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'umlCreator.css',
						}
					},
					{
						loader: 'extract-loader'
					},
					{
						loader: 'css-loader?-url'
					},
					{
						loader: 'sass-loader'
					}
				]
			}
        ],
    },
    plugins: [
        new CopyPlugin([
            { from: 'src/index.html', to: './' },
            { from: 'assets/**', to: './' },
        ]),
        new BrowserSyncPlugin({
            // browse to http://localhost:3000/ during development,
            host: 'localhost',
            port: 3000,
            server: { baseDir: ['.tmp'] }
        }),
    ],  
    output: {
        filename: 'umlCreator.js',
        path: path.resolve(__dirname, '../.tmp'),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    },
    mode: 'development',
    devtool: 'inline-source-map'
});