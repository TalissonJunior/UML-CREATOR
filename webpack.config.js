const tsLintPlugin = require('tslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const PrettierPlugin = require("prettier-webpack-plugin");
const path = require('path');

module.exports = {
    entry: ['./src/app/app.ts', './src/scss/app.scss'],
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
							name: 'app.css',
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
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        new tsLintPlugin({
            files: ['./src/**/*.ts']
        }),
        new CopyPlugin([
            { from: 'src/index.html', to: './' },
            { from: 'assets/**', to: './' },
        ]),
        new BrowserSyncPlugin({
            // browse to http://localhost:3000/ during development,
            host: 'localhost',
            port: 3000,
            server: { baseDir: ['dist'] }
        }),
        new PrettierPlugin({
            printWidth: 80, // Specify the length of line that the printer will wrap on.
            tabWidth: 2, // Specify the number of spaces per indentation-level.
            useTabs: true, // Indent lines with tabs instead of spaces.
            semi: true,  // Print semicolons at the ends of statements.
            singleQuote: true, // Use single quote instead of double quote on strings.
            bracketSpacing: true, // Use space on brackets
            extensions: [ ".js", ".ts", ".html", ".scss" ]  // Which file extensions to process
        })
    ],
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, './dist'),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    mode: 'development',
    devtool: 'inline-source-map'
};