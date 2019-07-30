import { UML } from '../models/uml';
import { UMLProperty } from '../models/uml-property';
import { UMLMethod } from '../models/uml-method';
import { Utils } from './utils';
import { ContextMenu } from './context-menu';

declare const d3;

export class UMLCreator {
	// Yellow
	private bgColor = '#FFFFE0';
	private borderColor = '#000000';
	// Used to calculate width when input value changes
	private pixelByLetter = 8;
	private width = 100;
	private height = 50;
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
	private self: any;
	// Holds the uml data
	private uml: UML;

	constructor(uml: UML, parentContainer: any) {
		this.initialConfig(uml);
		this.self = this.create(parentContainer);
	}

	private initialConfig(uml: UML): void {
		this.uml = uml;

		this.width =
			this.minRequiredWidth > this.width ? this.minRequiredWidth : this.width;

		// Calculate properties height
		this.propertiesHeight = uml.properties.length * this.inputHeight;

		// Calculate methods height
		this.methodsHeight = uml.methods.length * (this.inputHeight + this.padding);

		// Calculate total height
		this.height =
			this.headerHeight + this.propertiesHeight + this.methodsHeight;
	}

	private create(parent: any): any {
		const group = parent
			.append('g')
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
			})
			.on('contextmenu', function() {
				new ContextMenu([
					{
						title: 'Add Property',
						action: () => {
							// Todo add input to create property
						}
					},
					{
						title: 'Add Method',
						action: () => {
							// Todo add input to create method
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

		return group;
	}

	private addHeader(key: string | number, element: any, title: string): any {
		// Group elements
		const group = element.append('g').attr('type', 'header');

		// Add background to the group
		group.append('rect').attrs({
			type: 'back-header',
			stroke: this.borderColor,
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
				this.self.attr('drag', false);
			})
			// Add drag on focus out to avoid visual bugs
			.on('focusout', () => {
				setTimeout(() => {
					this.self.attr('drag', true);
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
		// Group elements
		const group = element.append('g').attr('type', 'properties');

		// Add background to the group
		group.append('rect').attrs({
			type: 'back-properties',
			stroke: this.borderColor,
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
			.attr('width', (property: UMLProperty) =>
				this.getInputPropertyWidth(property)
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
				this.self.attr('drag', false);
			})
			// Add drag on focus out to avoid visual bugs
			.on('focusout', () => {
				setTimeout(() => {
					this.self.attr('drag', true);
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

				const newWidth = this.getInputPropertyWidth(property);
				this.updateWidth(foreignObject, newWidth);
			});

		return group;
	}

	private addMethods(
		key: string | number,
		element: any,
		methods: Array<UMLMethod>
	): any {
		// Group elements
		const group = element.append('g').attr('type', 'methods');

		// Add background to the group
		group.append('rect').attrs({
			type: 'back-methods',
			stroke: this.borderColor,
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
				const minMethodSize =
					method.name.length +
					method.type.length +
					method.parameters
						.map(parameter => parameter.name.length + parameter.type.length)
						.reduce(
							(previousValue, currentValue) => previousValue + currentValue
						);

				return minMethodSize * this.pixelByLetter + this.padding + 10;
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

				const methodType = method.type ? ': ' + method.type : '';

				method.type = '';
				method.parameters = [];

				return (
					this.getVisibilitySymbol(method.visibility) +
					method.name +
					`(${parameters.join(', ')})` +
					methodType
				);
			})
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
			// Updates input width based on the new value
			.on('input', (property: UMLProperty) => {
				const foreignObject = d3.select(`foreignObject[key="${property.key}"]`);
				const element = foreignObject.select(
					`input[key="${property.key}_input"]`
				);

				property.name = element.node().value;
				property.type = '';

				const newWidth = this.getInputPropertyWidth(property);
				this.updateWidth(foreignObject, newWidth);
			});

		return group;
	}

	// Updates the width of the element and its dependencies based
	// on the property value;
	private updateWidth(currentForeignObject: any, newWidth: number) {
		let containersWidth = newWidth;
		const headerElement = this.self.select('[type="header"] foreignObject');
		const backgroundHeaderElement = this.self.select(
			'rect[type="back-header"]'
		);
		const backgroundPropElement = this.self.select(
			'rect[type="back-properties"]'
		);
		const backgroundMethodElement = this.self.select(
			'rect[type="back-methods"]'
		);

		const minimumRequiredWidth = this.minRequiredWidth;

		// Check if the new width is less then the minimum
		if (newWidth < minimumRequiredWidth) {
			containersWidth = minimumRequiredWidth;
		}

		this.self.attr('width', containersWidth + this.padding);
		backgroundHeaderElement.attr('width', containersWidth + this.padding);
		backgroundPropElement.attr('width', containersWidth + this.padding);
		backgroundMethodElement.attr('width', containersWidth + this.padding);

		// Calculates header margin to align center
		const margin =
			(containersWidth -
				this.uml.name.length * this.pixelByLetter +
				this.padding) /
			2;

		// Calculates header width based on margin to align center
		const headerWidth =
			newWidth < minimumRequiredWidth
				? containersWidth - margin
				: newWidth - margin;

		headerElement.attr('width', headerWidth);
		headerElement.attr('x', margin);

		// Updates the current input width
		currentForeignObject.attr('width', newWidth);
	}

	// Tip: After binding the drag, use the attribute 'drag' to disable or enable it
	private bindDrag(element: any): void {
		let deltaX, deltaY;

		const drag = d3
			.drag()
			.on('start', () => {
				const canDrag = element.attr('drag') == 'true' ? true : false;

				// Close context menu if it is open
				new ContextMenu('close');

				if (!canDrag) return;

				deltaX = (element.attr('x') as any) - d3.event.x;
				deltaY = (element.attr('y') as any) - d3.event.y;
			})
			.on('drag', () => {
				const canDrag = element.attr('drag') == 'true' ? true : false;
				const x = d3.event.x + deltaX;
				const y = d3.event.y + deltaY;

				// Close context menu if it is open
				new ContextMenu('close');

				if (!canDrag) return;

				element
					.attr('x', x)
					.attr('y', y)
					.attr('transform', `translate(${x},${y})`);
			});

		element.call(drag);
	}

	private getInputPropertyWidth(property: UMLProperty): number {
		return (
			(property.name.length + property.type.length) * this.pixelByLetter +
			this.padding
		);
	}

	private getVisibilitySymbol(visibility: string) {
		if (!visibility) {
			return ' ';
		}

		switch (visibility.toLowerCase()) {
			case 'public':
				return '+ ';
			case 'private':
				return '- ';
			case 'protected':
				return '# ';
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
			...this.uml.methods.map(
				method =>
					method.name.length +
					method.type.length +
					method.parameters
						.map(parameter => parameter.name.length + parameter.type.length)
						.reduce(
							(previousValue, currentValue) => previousValue + currentValue
						)
			)
		);

		const minSize =
			minPropertySize > minMethodSize ? minPropertySize : minMethodSize;

		const minWidth =
			minSize > this.uml.name.length ? minSize : this.uml.name.length;

		return minWidth * this.pixelByLetter + this.padding + 15;
	}
}
