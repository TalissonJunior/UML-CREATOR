import { UML } from '../models/uml';
import { UMLProperty } from '../models/uml-property';
import { UMLMethod } from '../models/uml-method';
import { Utils } from './utils';
import { ContextMenu } from './context-menu';
import { createDefaultMethod } from '../mocks/default-method';
import { createDefaultProperty } from '../mocks/default-property';
import { PropertyVisibility } from '../enums/property-visibility';
import { PropertyVisibilitySymbol } from '../enums/property-visibility-symbol';
import { UMLParameter } from '../models/uml-parameter';
import { UMLPosition } from '../models/uml-position';

declare const d3;

export class UMLCreator {
  // Yellow
  private bgColor = '#FFFFE0';
  public defaultBorderColor = '#000000';
  // Used to calculate width when input value changes
  private pixelByLetter = 8;
  public width = 100;
  public height = 50;
  // Height of header container
  private headerHeight = 30;
  // Height of properties container
  private propertiesHeight = 30;
  // Height of methods container
  private methodsHeight = 30;
  // Height of inputs
  private inputHeight = 25;
  private padding = 10;
  // Holds a instance of it self
  public instance: any;
  // Holds the uml data
  public uml: UML;

  constructor(uml: UML, parentContainer: any) {
    this.initialConfig(uml);
    this.instance = this.create(parentContainer);
  }

  private initialConfig(uml: UML): void {
    this.uml = uml;

    this.width =
      this.minRequiredWidth > this.width ? this.minRequiredWidth : this.width;

    this.width = this.width + this.padding + 15;

    // Calculate properties height
    this.propertiesHeight = uml.properties.length * this.inputHeight;

    // Calculate methods height
    this.methodsHeight = uml.methods.length * (this.inputHeight + this.padding);

    // Calculate total height
    this.height =
      this.headerHeight + this.propertiesHeight + this.methodsHeight;
  }

  private create(parent: any): any {
    const selfContext = this;

    const group = parent
      .append('g')
      .attrs({
        key: this.uml.key,
        height: this.height,
        width: this.width,
        x: this.uml.position.x,
        y: this.uml.position.y,
        transform: `translate(
                ${this.uml.position.x},
                ${this.uml.position.y})`
      })
      .on('contextmenu', function() {
        new ContextMenu([
          {
            title: 'Add Property',
            action: () => {
              selfContext.addRemoveProperty();
            }
          },
          {
            title: 'Add Method',
            action: () => {
              selfContext.addRemoveMethod();
            }
          },
          {
            title: 'Remove',
            action: () => {
              group.remove();
            }
          }
        ]);
      });

    this.addHeader(this.uml.key, group, this.uml.name);
    this.addProperties(this.uml.key, group, this.uml.properties);
    this.addMethods(this.uml.key, group, this.uml.methods);
    this.bindDrag(group);
    this.addBorder(group);

    return group;
  }

  public enableDrag(): void {
    this.bindDrag(this.instance);
  }

  public disableDrag(): void {
    this.instance.on('mousedown.start', null);
    this.instance.on('mousedown.drag', null);
  }

  public changeBorderColor(color: string): any {
    this.instance.select('[type="border"]').attr('stroke', color);
  }

  public getBorderColor(): string {
    return this.instance.select('[type="border"]').attr('stroke');
  }

  private addBorder(element: any): any {
    element.append('rect').attrs({
      key: 'border',
      type: 'border',
      stroke: this.defaultBorderColor,
      'stroke-width': '1px',
      height: this.height,
      width: this.width,
      fill: 'none',
      style: 'cursor:grab;'
    });
  }

  private addHeader(key: string | number, element: any, title: string): any {
    // Group elements
    const group = element.append('g').attr('type', 'header');

    // Add background to the group
    group.append('rect').attrs({
      type: 'back-header',
      stroke: this.defaultBorderColor,
      'stroke-width': '1px',
      height: this.headerHeight,
      width: this.width,
      fill: this.bgColor,
      style: 'cursor:grab;',
      y: 0
    });

    // Add the title
    group
      .append('foreignObject')
      // Align horizontal center
      .attr('x', (this.width - title.length * this.pixelByLetter + 2) / 2)
      // Align vertical center
      .attr('y', this.headerHeight / 6)
      .attr('width', title.length * this.pixelByLetter + 2)
      .attr('height', this.inputHeight)
      .attr('key', key + '_header')
      .append('xhtml:div')
      .append('input')
      .attr('class', 'uml_input')
      .attr('value', title)
      // Remove drag on focus to avoid visual bugs
      .on('focus', () => {
        this.disableDrag();
        d3.select('body').attr('canZoom', false);
      })
      // Add drag on focus out to avoid visual bugs
      .on('focusout', () => {
        setTimeout(() => {
          this.enableDrag();
          d3.select('body').attr('canZoom', true);
        }, 200);
      })
      // Updates input width based on the new value
      .on('input', () => {
        const foreignObject = d3.select(`foreignObject[key="${key}_header"]`);
        const element = d3.select(`foreignObject[key="${key}_header"] input`);

        this.uml.name = element.node().value;

        const newWidth = element.node().value.length * this.pixelByLetter + 2;

        this.updateWidth(foreignObject, newWidth);
      });

    return group;
  }

  private addProperties(
    key: string | number,
    element: any,
    properties: Array<UMLProperty>
  ): Array<any> {
    const selfContext = this;

    // Group elements
    const group = element.append('g').attr('type', 'properties');

    // Add background to the group
    group.append('rect').attrs({
      type: 'back-properties',
      stroke: this.defaultBorderColor,
      'stroke-width': '1px',
      height: this.propertiesHeight,
      width: this.width,
      fill: this.bgColor,
      style: 'cursor:grab;',
      y: this.headerHeight
    });

    // Add the properties inputs
    group
      .selectAll('text')
      .data(properties)
      .enter()
      .append('foreignObject')
      .attr('key', (property: UMLProperty) => {
        property.key = key + '_property_' + Utils.generateID();

        return property.key;
      })
      .attr('x', this.padding)
      // the position of each property on Y
      .attr(
        'y',
        (property: UMLProperty, index: number) =>
          (index + 1.3) * this.inputHeight + 'px'
      )
      .attr(
        'width',
        (property: UMLProperty) =>
          this.getInputPropertyWidth(property) + this.padding + 15
      )
      .attr('height', this.inputHeight)
      .append('xhtml:div')
      .append('input')
      .attr('class', 'uml_input')
      .attr('key', (property: UMLProperty) => {
        return property.key + '_input';
      })
      .attr(
        'value',
        (property: UMLProperty) =>
          this.getVisibilitySymbol(property.visibility) +
          `${property.name}: ${property.type}`
      )
      // Remove drag on focus to avoid visual bugs
      .on('focus', () => {
        this.disableDrag();
        d3.select('body').attr('canZoom', false);
      })
      // Add drag on focus out to avoid visual bugs
      .on('focusout', () => {
        setTimeout(() => {
          this.enableDrag();
          d3.select('body').attr('canZoom', true);
        }, 200);
      })
      // Updates input width based on the new value
      .on('input', (property: UMLProperty) => {
        const foreignObject = d3.select(`foreignObject[key="${property.key}"]`);
        const element = foreignObject.select(
          `input[key="${property.key}_input"]`
        );

        property.name = element.node().value;
        property.type = '';

        const newWidth = this.getInputPropertyWidth(property) + this.padding;
        this.updateWidth(foreignObject, newWidth);
      })
      .on('contextmenu', function(property: UMLProperty) {
        new ContextMenu([
          {
            title: 'Remove',
            action: () => {
              selfContext.addRemoveProperty(property.key);
            }
          }
        ]);
      });

    return group;
  }

  private addMethods(
    key: string | number,
    element: any,
    methods: Array<UMLMethod>
  ): any {
    const selfContext = this;

    // Group elements
    const group = element.append('g').attr('type', 'methods');

    // Add background to the group
    group.append('rect').attrs({
      type: 'back-methods',
      stroke: this.defaultBorderColor,
      'stroke-width': '1px',
      height: this.methodsHeight,
      width: this.width,
      fill: this.bgColor,
      style: 'cursor:grab;',
      y: this.propertiesHeight + this.headerHeight
    });

    // Add the methods inputs
    group
      .selectAll('text')
      .data(methods)
      .enter()
      .append('foreignObject')
      .attr('key', (property: UMLMethod) => {
        property.key = key + '_method_' + Utils.generateID();

        return property.key;
      })
      .attr('x', this.padding)
      .attr('y', (method: UMLMethod, index: number) => {
        return (
          this.propertiesHeight +
          this.headerHeight +
          this.inputHeight * (index + 0) +
          this.padding +
          'px'
        );
      })
      .attr('width', (method: UMLMethod) => {
        let parametersSize = 0;
        const parameters = method.parameters.map(
          parameter => parameter.name.length + parameter.type.length
        );

        if (parameters.length > 0) {
          parametersSize = parameters.reduce(
            (previousValue, currentValue) => previousValue + currentValue
          );
        }

        const minMethodSize =
          method.name.length + method.type.length + parametersSize;

        const minSize = minMethodSize * this.pixelByLetter;

        return minSize + this.padding + 15;
      })
      .attr('height', this.inputHeight)
      .append('xhtml:div')
      .append('input')
      .attr('key', (property: UMLProperty) => {
        return property.key + '_input';
      })
      .attr('class', 'uml_input')
      .attr('value', (method: UMLMethod) => {
        const parameters = method.parameters.map(parameter => {
          return parameter.name + ': ' + parameter.type;
        });

        const methodType = method.type ? ': ' + method.type.trim() : '';

        return (
          this.getVisibilitySymbol(method.visibility) +
          method.name +
          `(${parameters.join(', ')})` +
          methodType
        );
      })
      // Remove drag on focus to avoid visual bugs
      .on('focus', () => {
        this.disableDrag();
        d3.select('body').attr('canZoom', false);
      })
      // Add drag on focus out to avoid visual bugs
      .on('focusout', () => {
        setTimeout(() => {
          this.enableDrag();
          d3.select('body').attr('canZoom', true);
        }, 200);
      })
      // Updates input width based on the new value
      .on('input', (method: UMLMethod) => {
        const foreignObject = d3.select(`foreignObject[key="${method.key}"]`);
        const element = foreignObject.select(
          `input[key="${method.key}_input"]`
        );

        method.name = element.node().value;
        method.type = '';
        method.parameters = [];

        const newWidth = this.getInputPropertyWidth(method) - this.padding * 3;
        this.updateWidth(foreignObject, newWidth + this.padding);
      })
      .on('contextmenu', function(method: UMLMethod) {
        new ContextMenu([
          {
            title: 'Remove',
            action: () => {
              selfContext.addRemoveMethod(method.key);
            }
          }
        ]);
      });

    return group;
  }

  // Updates the width of the element and its dependencies based
  // on the property value;
  private updateWidth(currentForeignObject: any, newWidth: number) {
    let containersWidth = newWidth;
    const headerElement = this.instance.select('[type="header"] foreignObject');
    const backgroundHeaderElement = this.instance.select(
      'rect[type="back-header"]'
    );
    const backgroundPropElement = this.instance.select(
      'rect[type="back-properties"]'
    );
    const backgroundMethodElement = this.instance.select(
      'rect[type="back-methods"]'
    );

    const minimumRequiredWidth = this.minRequiredWidth;

    // Check if the new width is less then the minimum
    if (newWidth < minimumRequiredWidth) {
      containersWidth = minimumRequiredWidth + this.padding + 15;
    }

    this.instance.attr('width', containersWidth);
    backgroundHeaderElement.attr('width', containersWidth);
    backgroundPropElement.attr('width', containersWidth);
    backgroundMethodElement.attr('width', containersWidth);
    this.instance.select('[type="border"]').attr('width', containersWidth);

    const headerInputWidth = this.uml.name.length * this.pixelByLetter;

    // Calculates header margin to align center
    const margin = (containersWidth - headerInputWidth) / 2;

    headerElement.attr('width', headerInputWidth);
    headerElement.attr('x', margin);

    // Updates the current input width
    currentForeignObject.attr('width', newWidth);
  }

  private bindDrag(element: any): void {
    let deltaX, deltaY;

    const drag = d3
      .drag()
      .on('start', () => {
        // Close context menu if it is open
        new ContextMenu('close');

        deltaX = (element.attr('x') as any) - d3.event.x;
        deltaY = (element.attr('y') as any) - d3.event.y;
      })
      .on('drag', () => {
        const x = d3.event.x + deltaX;
        const y = d3.event.y + deltaY;

        // Close context menu if it is open
        new ContextMenu('close');

        element
          .attr('x', x)
          .attr('y', y)
          .attr('transform', `translate(${x},${y})`);

        this.uml.position = new UMLPosition({ x, y });
      });

    element.call(drag);
  }

  private addRemoveProperty(propertyKeyToRemove?: string | number) {
    let hasUpdateProperties = false;

    if (propertyKeyToRemove) {
      const index = this.uml.properties.findIndex(
        property => property.key == propertyKeyToRemove
      );

      if (index > -1) {
        this.uml.properties.splice(index, 1);
        hasUpdateProperties = true;
      }
    } else {
      this.uml.properties.push(createDefaultProperty());
      hasUpdateProperties = true;
    }

    if (hasUpdateProperties) {
      // Remove the previous header
      d3.select(`[key="${this.uml.key}"]`)
        .select('[type="header"]')
        .remove();

      // Remove the previous properties
      d3.select(`[key="${this.uml.key}"]`)
        .select('[type="properties"]')
        .remove();

      // Remove the previous methods
      d3.select(`[key="${this.uml.key}"]`)
        .select('[type="methods"]')
        .remove();

      // Calculate properties height
      this.propertiesHeight = this.uml.properties.length * this.inputHeight;

      // Calculate methods height
      this.methodsHeight =
        this.uml.methods.length * this.inputHeight + this.padding;

      this.uml = this.formatPropertiesAndMethods(this.uml);

      this.addHeader(this.uml.key, this.instance, this.uml.name);
      this.addProperties(this.uml.key, this.instance, this.uml.properties);
      this.addMethods(this.uml.key, this.instance, this.uml.methods);
    }
  }

  private addRemoveMethod(methodKeyToRemove?: string | number) {
    let hasUpdateMethods = false;

    if (methodKeyToRemove) {
      const index = this.uml.methods.findIndex(
        method => method.key == methodKeyToRemove
      );

      if (index > -1) {
        this.uml.methods.splice(index, 1);
        hasUpdateMethods = true;
      }
    } else {
      this.uml.methods.push(createDefaultMethod());
      hasUpdateMethods = true;
    }

    if (hasUpdateMethods) {
      // Remove the previous header
      d3.select(`[key="${this.uml.key}"]`)
        .select('[type="header"]')
        .remove();

      // Remove the previous properties
      d3.select(`[key="${this.uml.key}"]`)
        .select('[type="properties"]')
        .remove();

      // Remove the previous methods
      d3.select(`[key="${this.uml.key}"]`)
        .select('[type="methods"]')
        .remove();

      // Calculate properties height
      this.propertiesHeight = this.uml.properties.length * this.inputHeight;

      // Calculate methods height
      this.methodsHeight =
        this.uml.methods.length * this.inputHeight + this.padding;

      this.uml = this.formatPropertiesAndMethods(this.uml);

      this.addHeader(this.uml.key, this.instance, this.uml.name);
      this.addProperties(this.uml.key, this.instance, this.uml.properties);
      this.addMethods(this.uml.key, this.instance, this.uml.methods);
    }
  }

  // Each time user change a value of a property, the UMLCreator
  // will put the value on property.name and reset property.type, property.visibility
  // so this function will put back the value to its place
  // ex of property when user inputs value:
  // value: + teste: String
  // property: { name: '+ teste: String', type: '', visibility: ''}
  // After using this function the property will be:
  // property: { name: 'teste', type: 'String', visibility: '+'}
  // this rule applies to methods to
  private formatPropertiesAndMethods(uml: UML): UML {
    // Handle properties format
    for (let index = 0; index < uml.properties.length; index++) {
      let property = uml.properties[index];
      const arrayNameAndType = property.name.split(':');

      // If length is bigger then 1 is because name contains '[propertyName] | [type]'
      if (arrayNameAndType.length > 1) {
        property.type = arrayNameAndType[1].trim();

        const arrayNameVisib = arrayNameAndType[0].trim().split(' ');

        // If length is bigger then 1 is because
        // arrayNameAndType contains '[visibilitySymbol] | [propertyName]'
        if (arrayNameVisib.length > 1) {
          switch (arrayNameVisib[0].trim().toLowerCase()) {
            case PropertyVisibilitySymbol.public:
              property.visibility = PropertyVisibility.public;
              break;
            case PropertyVisibilitySymbol.private:
              property.visibility = PropertyVisibility.private;
              break;
            case PropertyVisibilitySymbol.protected:
              property.visibility = PropertyVisibility.protected;
              break;
            default:
              property.visibility = '';
              break;
          }

          property.name = arrayNameVisib[1].trim();
        }
        // Else it only contains the '[propertyName]'
        else {
          property.name = arrayNameAndType[0].trim();
        }
      }

      uml.properties[index] = property;
    }

    // Handle methods format
    for (let index = 0; index < uml.methods.length; index++) {
      let method = uml.methods[index];

      if (method.type == '' && method.parameters.length == 0) {
        //arrayNameAndParameters contains '[visibilitySymbol methodName ]| [parameter: Type): Type]'
        const arrayNameAndParameters = method.name.split('(');

        // arrayNameVisib contains '[visibilitySymbol] | [ methodName ]'
        const arrayNameVisib = arrayNameAndParameters[0].trim().split(' ');

        // If length is bigger then 1 is because
        // arrayNameAndType contains '[visibilitySymbol] | [ methodName ]'
        if (arrayNameVisib.length > 1) {
          method.name = arrayNameVisib[1].trim();

          switch (arrayNameVisib[0].trim().toLowerCase()) {
            case PropertyVisibilitySymbol.public:
              method.visibility = PropertyVisibility.public;
              break;
            case PropertyVisibilitySymbol.private:
              method.visibility = PropertyVisibility.private;
              break;
            case PropertyVisibilitySymbol.protected:
              method.visibility = PropertyVisibility.protected;
              break;
            default:
              method.visibility = '';
              break;
          }
        } else {
          method.name = arrayNameVisib[0].trim();
        }

        // arrayNameAndParameters contains
        // '[visibilitySymbol methodName ]| [parameter: Type): Type]'
        if (arrayNameAndParameters.length > 1) {
          // Handle parameters and method type
          const arrayParametersAndMethodType = arrayNameAndParameters[1]
            .trim()
            .split(')');

          // arrayParametersAndType[0] contains '[parameter: Type, parameter2:type]'
          const arrayParametersAndType = arrayParametersAndMethodType[0]
            .trim()
            .split(',');

          for (let index = 0; index < arrayParametersAndType.length; index++) {
            const arrayParamNameType = arrayParametersAndType[index].split(':');
            let type = '';
            const name = arrayParamNameType[0].trim();

            if (arrayParamNameType.length > 1) {
              type = arrayParamNameType[1].trim();
            }

            if (name || type) {
              method.parameters.push(new UMLParameter({ name, type }));
            }
          }

          // If length is bigger then 1 its because arrayParametersAndType
          // contains '[parameter: Type, parameter2:type] | [:Type]'
          if (arrayParametersAndMethodType.length > 1) {
            let type = arrayParametersAndMethodType[1].trim();
            method.type = type.indexOf(':') == 0 ? type.substring(1) : type;
          }
        }
        // Else it only contains the 'methodName'
        else {
          method.name = arrayNameVisib[0].trim();
        }
      }
    }

    return uml;
  }

  private getInputPropertyWidth(property: UMLProperty | UMLMethod): number {
    const size =
      (property.name.length + property.type.length) * this.pixelByLetter;

    return size;
  }

  private getVisibilitySymbol(visibility: string) {
    if (!visibility) {
      return ' ';
    }

    switch (visibility.toLowerCase()) {
      case PropertyVisibility.public:
        return PropertyVisibilitySymbol.public + ' ';
      case PropertyVisibility.private:
        return PropertyVisibilitySymbol.private + ' ';
      case PropertyVisibility.protected:
        return PropertyVisibilitySymbol.protected + ' ';
      default:
        return ' ';
    }
  }

  // Calculates the minimum required width bas on propreties and methods
  private get minRequiredWidth(): number {
    const minPropertySize = Math.max(
      ...this.uml.properties.map(
        property => property.name.length + property.type.length
      )
    );

    const minMethodSize = Math.max(
      ...this.uml.methods.map(method => {
        let parametersSize = 0;
        const parameters = method.parameters.map(
          parameter => parameter.name.length + parameter.type.length
        );

        if (parameters.length > 0) {
          parametersSize = parameters.reduce(
            (previousValue, currentValue) => previousValue + currentValue
          );
        }

        return method.name.length + method.type.length + parametersSize;
      })
    );

    const minSize =
      minPropertySize > minMethodSize ? minPropertySize : minMethodSize;

    const minWidth =
      minSize > this.uml.name.length ? minSize : this.uml.name.length;

    const mult = minWidth * this.pixelByLetter;

    return mult + this.padding;
  }
}
