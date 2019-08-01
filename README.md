![Build Status](https://travis-ci.org/TalissonJunior/UML-CREATOR.svg?branch=master)
# UML-CREATOR-JS

A UML Creator that manages UML Diagrams by outputting and inputting the draws as json file,  writting in Javascript using [Typescript](https://www.typescriptlang.org/) and [d3js](https://d3js.org/) 


![Example](https://raw.githubusercontent.com/TalissonJunior/UML-CREATOR/master/.github/example.jpg)

### Prerequisites

Node.js 
 
>[Node.js](https://nodejs.org/), recomended to download any stable version above 10.16.1


### Usage in production

Install dependencies
```sh
npm install 
```

Build , it will output 2 files "`umlCreator.min.js` and `umlCreator.min.css`" under './dist' folder

```sh
npm run build 
```


Import the [d3js](https://d3js.org/) dependecies. 
```html
<script src="http://d3js.org/d3.v4.min.js"></script>
<script src="https://d3js.org/d3-selection-multi.v1.min.js"></script>
```

Then import the output build files
```html
<link rel="stylesheet" href=".dist/umlCreator.min.css">
<script src="./dist/umlCreator.min.js"></script>
```

### Development.


To serve the application and watch for changes type. 
```sh
npm run serve
```
it will open a browser running a server on http://localhost:3000/

