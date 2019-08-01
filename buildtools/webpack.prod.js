const path = require('path');
const merge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('../webpack.config.js');

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
							name: 'umlCreator.min.css',
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
            { from: 'assets/**', to: './' },
        ])
    ],  
    output: {
        filename: 'umlCreator.min.js',
        path: path.resolve(__dirname, '../dist')
    },
    mode: 'production',
});