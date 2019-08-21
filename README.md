![Build Status](https://travis-ci.org/TalissonJunior/UML-CREATOR.svg?branch=master)
# UML-CREATOR-JS

A UML Creator that manages UML Diagrams by outputting and inputting the draws as json file,  writting in Javascript using [Typescript](https://www.typescriptlang.org/) and [d3js](https://d3js.org/) 


![Example](https://raw.githubusercontent.com/TalissonJunior/UML-CREATOR/master/.github/example.jpg)

### Prerequisites

Node.js 
 
>[Node.js](https://nodejs.org/), recomended to download any stable version above 10.16.1


### Usage in production

Import the [d3js](https://d3js.org/) dependecies. 
```html
<script src="http://d3js.org/d3.v4.min.js"></script>
<script src="https://d3js.org/d3-selection-multi.v1.min.js"></script>
```

Then import the output build files located inside './dist/' folder
```html
<link rel="stylesheet" href="./dist/umlCreator.min.css">
<script src="./dist/umlCreator.min.js"></script>
```

Example
```html
<script>
    // Initializing uml
    const umlCreator = UmlCreator.init('body');

    // Here you can fetch from an api, instead of hard coding
    // Just make sure the json comes formatted;
    const json = {
        data : {
            nodes: [
                {
                    key: 1,
                    name: 'Professor',
                    properties: [
                        {
                            name: 'classes',
                            type: 'List<Course>',
                            visibility: 'public'
                        }
                    ],
                    methods: [
                        {
                            name: 'Teach',
                            visibility: 'public',
                            type: 'void',
                            parameters: [
                                {
                                    name: 'class',
                                    type: 'Course'
                                }
                            ]
                        }
                    ],
                    position: {
                        x: 10,
                        y: 10
                    }
                },
                {
                    key: 2,
                    name: "Course",
                    properties: [
                        { 
                            name: "name", 
                            type: "String", 
                            visibility: "public" 
                        },
                        { 
                            name: "description", 
                            type: "String", 
                            visibility: "public" 
                        },
                        { 
                            name: "professor", 
                            type: "Professor", 
                            visibility: "public" 
                        },
                        { 
                            name: "location", 
                            type: "String", 
                            visibility: "public" 
                        },
                        { 
                            name: "times", 
                            type: "List<String>", 
                            visibility: "public" 
                        },
                        { 
                            name: "prerequisites", 
                            type: "List<String>", 
                            visibility: "public" 
                        },
                        { 
                            name: "students", 
                            type: "List<String>", 
                            visibility: "public" 
                        }
                    ],
                    methods: [],
                    position: {
                        x: 150,
                        y: 150
                    }
                }

            ],
            links: [
                {
                    source: 1,
                    target: 2
                }
            ]
        }
    }

    // Tells UMLCreator to build umls from json
    umlCreator.fromJson(json);

    // Use this method to export as json
    const outputJson = umlCreator.toJson();

    // Listen to any changes
    umlCreator.on('change', function(uml) {
        // Do something with uml
        console.log(umlCreator.toJson())
    });

    // Listen to property and method changes
    umlCreator.on(['change:property', 'change:method'], function(uml) {
        // Do something with uml
    });
    
 </script>
```

#### ON Change Listenners
List of available listenners 

| Value        | Description   | CallbackParams         
| ------------- | -------------| -------------
| ``change``      | Listen to any changes | (uml) 
| ``delete``    | Emitted when the class is deleted  | (uml)
| ``change:name``    | Emitted when the class name changes | (uml)
| ``change:property``    | Emitted when the class properties changes | (uml)
| ``change:method``    | Emitted when the class methods changes | (uml)
| ``change:position``    | Emitted when the class position change | (uml)
| ``change:link``    | Emitted when the class links changes | (umlSource, umlTarget)

Usage:

```html
<script>
    const umlCreator = UmlCreator.init('body');

    // Listen to one change at time
    umlCreator.on('value', (callbackParams) => {});

    // Listen to multiple changes at time
    umlCreator.on(['value', 'value'], (callbackParams) => {});
</script>
```
### Development.


To serve the application and watch for changes type. 
```sh
npm run serve
```
it will open a browser running a server on http://localhost:3000/

To build type

```sh
npm run build
```