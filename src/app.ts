import { UMLCreator } from "./uml-creator";
import { mockData } from "./mocks/data";

declare const d3;

class App {
    svgContainer;

    constructor(){
       this.svgContainer = this.create();

       for (let uml of mockData) {
            new UMLCreator(
                uml,
                this.svgContainer
           )
       }
     
    }

    create(): any {
        const container = d3.select('#uml_diagram_workspace')
            .append('svg')
            .attrs({ 
                width: window.innerWidth,
                height: window.innerHeight
            })
            // Add zoom
            .call(d3.zoom().on("zoom", () => {
                container.attr("transform", d3.event.transform);
            }))
            .append("g");
        
        // Update workspace width and height on window resize
        window.addEventListener("resize", () => {
            d3.select(container.node().parentNode).attrs({
                width: window.innerWidth,
                height: window.innerHeight
            });
        });
       
        return container;
    }

}

const app = new App();