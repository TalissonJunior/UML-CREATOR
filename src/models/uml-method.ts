import { UMLParameter } from './uml-parameter';

export class UMLMethod {
	key?: string | number;
	name: string;
	visibility: string;
	type: string;
	parameters: Array<UMLParameter>;
}
