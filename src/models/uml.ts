import { UMLProperty } from './uml-property';
import { UMLMethod } from './uml-method';
import { UMLPosition } from './uml-position';

export class UML {
	key: string | number;
	name: string;
	properties: Array<UMLProperty>;
	methods: Array<UMLMethod>;
	position: UMLPosition;

	constructor(uml: UML) {
		if (uml == null) {
			throw Error('UML cannot be null');
		}

		this.key = uml.key;
		this.name = uml.name;
		this.properties = uml.properties;
		this.methods = uml.methods;
		this.position = uml.position;
	}
}
