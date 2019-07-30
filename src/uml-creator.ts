import { UML } from "./models/uml";
import { UMLProperty } from "./models/uml-property";
import { UMLMethod } from "./models/uml-method";

declare const d3;

export class UMLCreator {
    // Yellow
    private bgColor = "#FFFFE0";
    private borderColor ="#000000";
    // Used to calculate width when inputing data
    private pixelByLetter = 8; 
    private width = 100;
    private height = 50;
    private headerHeight = 30;
    private propertiesHeight = 30;
    private methodsHeight = 30;
    private inputHeight = 25;
    private padding = 10;
    // Holds a instance of it self
    private self: any;
    // Holds the uml data
    private uml: UML;

    constructor(
       uml: UML,
       parentContainer: any
    ) {
        this.initialConfig(uml);
        this.uml = uml;
        this.self = this.create(parentContainer);
    }

    private initialConfig(uml: UML): void {
        // Calculate the max name length to get the default width
        const maxNameLength = Math.max(
            ...uml.properties.map(property => 
                property.name.length + property.type.length));

        const max = maxNameLength > uml.name.length ? 
            maxNameLength : uml.name.length;      
        const maxWidth = (max * this.pixelByLetter) + this.padding;        

        this.width = maxWidth > this.width ? maxWidth : this.width;

        // Calculate properties height
        this.propertiesHeight = uml.properties.length * this.inputHeight; 

        // Calculate methods height
        this.methodsHeight = uml.methods.length * 
            (this.inputHeight + this.padding);  
            
        // Calculate total height
        this.height = this.headerHeight + 
            this.propertiesHeight + this.methodsHeight;
    }

    private create(parent: any): any {
        const group = parent.append("g")  
        .attrs({
            key: this.uml.key,
            height: this.height,
            width: this.width,
            drag: true,
            x: this.uml.position.x,
            y: this.uml.position.y,
            transform: `translate(
                ${this.uml.position.x},
                ${this.uml.position.y})`
        });
        
        this.addHeader(group, this.uml.name);
        this.addProperties(this.uml.key, group, this.uml.properties);
        this.addMethods(group, this.uml.methods);
        this.bindDrag(group);

        return group;
    }

    private addHeader(element: any, title: string): any {
        // group elements
        const group = element
            .append('g')
            .attr("type", 'header');

        // add background with bottom border    
        group
            .append('rect') 
            .attrs({ 
                type: 'back-header',
                stroke: this.borderColor,
                "stroke-width": "1px",
                height: this.headerHeight,
                width: this.width,
                fill: this.bgColor,
                style: 'cursor:grab;',
                y: 0
            });
        
        // Adds the title     
        group
            .append('foreignObject')
             // Align horizontal center
            .attr("x", (this.width - (title.length * this.pixelByLetter) + 2) / 2)
             // Align vertical center
            .attr("y", this.headerHeight / 6)
            .attr("width", (title.length * this.pixelByLetter) + 2)
            .attr("height", this.inputHeight)
            .append('xhtml:div')
            .append('input')
            .attr('class', 'uml_input')
            .attr('value', title)

        return group;
    }

    private addProperties(
        key: string | number, 
        element: any, 
        properties: Array<UMLProperty>)
        : Array<any> {
           
        // group elements
        const group = element
        .append('g')
        .attr("type", 'properties');

        group.append("rect")
            .attrs({ 
                type: 'back-properties',
                stroke: this.borderColor,
                "stroke-width": "1px",
                height: this.propertiesHeight,
                width: this.width,
                fill: this.bgColor,
                style: 'cursor:grab;',
                y: this.headerHeight
            });

        group
            .selectAll("text")
            .data(properties)
            .enter()
            .append("foreignObject")
            .attr("key", (property: UMLProperty) => {
                property.key = key + '' + this.generateID();

                return property.key;
            })
            .attr("x", this.padding)
            // the position of each property on Y
            .attr("y", (property: UMLProperty, index: number) => 
                ((index + 1.3) * this.inputHeight)  + "px"
            )
            // The input container width
            .attr("width", (property: UMLProperty) => 
                this.getInputPropertyWidth(property))
            .attr("height", this.inputHeight)
            .append('xhtml:div')
            .append('input')
            .attr('class', 'uml_input')
            .attr("key", (property: UMLProperty) => {
                return property.key + '_input';
            })
            .attr('value', (property: UMLProperty) => 
                `${property.name}: ${property.type}`)
            // Remove drag on focus to avoid visual bugs
            .on('focus', () => { 
                this.self.attr('drag', false);
            }) 
            // Add drag on focus out to avoid visual bugs
            .on('focusout', () => { 
                setTimeout(() => {
                    this.self.attr('drag', true);
                }, 200);
            })
            // Updates width on property input value change
            .on('input', (property: UMLProperty) => {
                const element = d3.select(`input[key="${property.key}_input"]`);
                property.name = element.node().value;
                property.type = '';

                this.updateWidth(property);
            });
       
        return group;
    }

    private addMethods(element: any, methods: Array<UMLMethod>): any {
        // group elements
        const group = element
            .append('g')
            .attr("type", 'methods');

        // add background with bottom border    
        group
            .append('rect') 
            .attrs({ 
                type: 'back-methods',
                stroke: this.borderColor,
                "stroke-width": "1px",
                height: this.methodsHeight,
                width: this.width,
                fill: this.bgColor,
                style: 'cursor:grab;',
                y: this.propertiesHeight + this.headerHeight
            });
        
        // Adds the methods     
        group
            .selectAll("text")
            .data(methods)
            .enter()
            .append('foreignObject')
            .attr("x", this.padding)
            .attr("y", () => 
                this.propertiesHeight + this.headerHeight + 5 + 'px')
            .attr("width", (method: UMLMethod) => 
                (method.name.length * this.pixelByLetter) + 2
            )
            .attr("height", this.inputHeight)
            .append('xhtml:div')
            .append('input')
            .attr('class', 'uml_input')
            .attr('value',  (method: UMLMethod) => method.name + '()')
            // Remove drag on focus to avoid visual bugs
            .on('focus', () => { 
                this.self.attr('drag', false);
            }) 
            // Add drag on focus out to avoid visual bugs
            .on('focusout', () => { 
                setTimeout(() => {
                    this.self.attr('drag', true);
                }, 200);
            })

        return group;
    }

    // Updates the width of the element and its dependencies based 
    // on the property value;
    private updateWidth(property: UMLProperty) {
      const containerWidth = this.self.attr('width'); 
      const foreignObject =  d3.select(`foreignObject[key="${property.key}"]`);
      const propertyWidth = foreignObject.attr('width');
      let newWidth = this.getInputPropertyWidth(property);

      if((parseInt(containerWidth) - this.padding) <= parseInt(propertyWidth)) {
        const headerElement = this.self.select('[type="header"] foreignObject');
        const backgroundHeaderElement = this.self.select('rect[type="back-header"]');
        const backgroundPropElement = this.self.select('rect[type="back-properties"]');
        const backgroundMethodElement = this.self.select('rect[type="back-methods"]');

        // Use the max name property length as the new width
        if(newWidth < parseInt(propertyWidth)) {

            const maxNameLength = Math.max(
                ...this.uml.properties.map(property => property.name.length));

            const max = maxNameLength > this.uml.name.length ? 
                maxNameLength : this.uml.name.length;    

            newWidth = (max * this.pixelByLetter) + 2;

        }
         
        this.self.attr('width', newWidth + this.padding);
        backgroundHeaderElement.attr('width', newWidth + this.padding);
        backgroundPropElement.attr('width', newWidth + this.padding);
        backgroundMethodElement.attr('width', newWidth + this.padding);

        // Calculates the center position for title header
        const margin =  (newWidth - 
            (this.uml.name.length * this.pixelByLetter) + this.padding) / 2;

        headerElement.attr('width', newWidth - margin);
        headerElement.attr('x', margin);
      }
        
       foreignObject.attr('width', newWidth);
    }

    // After binding the drag, use the attribute 'drag' to disable or enable it
    private bindDrag(element: any): void {
        let deltaX, deltaY;
        
        const drag = d3.drag()
        .on("start", () => {
            const canDrag = element.attr('drag') == 'true' ? true : false;

            if(!canDrag) 
               return;

            deltaX = element.attr("x") as any - d3.event.x;
            deltaY = element.attr("y") as any - d3.event.y;
        })
        .on("drag", () => {
            const canDrag = element.attr('drag') == 'true' ? true : false;
            const x =  d3.event.x + deltaX;
            const y =  d3.event.y + deltaY;

            if(!canDrag) 
               return;

            element
            .attr("x", x)
            .attr("y", y)
            .attr("transform", `translate(${x},${y})`);
           
        });
        
        element.call(drag);
    }
    
    private getInputPropertyWidth(property: UMLProperty): number {
        return ((property.name.length + property.type.length) * 
            this.pixelByLetter)
    }

    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    private generateID () {
        return '_' + Math.random().toString(36).substr(2, 9);
    };
  
}
