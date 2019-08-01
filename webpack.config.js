const tsLintPlugin = require('tslint-webpack-plugin');
const PrettierPlugin = require("prettier-webpack-plugin");

module.exports = {
    entry: ['./src/app/app.ts', './src/scss/app.scss'],
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        new tsLintPlugin({
            files: ['./src/**/*.ts']
        }),
        new PrettierPlugin({
            printWidth: 80, // Specify the length of line that the printer will wrap on.
            tabWidth: 2, // Specify the number of spaces per indentation-level.
            useTabs: false, // Indent lines with tabs instead of spaces.
            semi: true,  // Print semicolons at the ends of statements.
            singleQuote: true, // Use single quote instead of double quote on strings.
            bracketSpacing: true, // Use space on brackets
            extensions: [ ".js", ".ts", ".html", ".scss" ]  // Which file extensions to process
        })
    ],
    output: {
        library: 'umlCreator',
        libraryTarget: 'var'
    }
};