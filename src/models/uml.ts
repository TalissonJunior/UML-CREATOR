import { UMLProperty } from './uml-property';
import { UMLMethod } from './uml-method';
import { UMLPosition } from './uml-position';

export class UML {
    key: string | number;
    name: string;
    properties: Array<UMLProperty>;
    methods: Array<UMLMethod>;
    position: UMLPosition;
}