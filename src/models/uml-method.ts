import { UMLParameter } from './uml-parameter';

export class UMLMethod {
  key?: string | number;
  name: string;
  visibility: string;
  type: string;
  parameters: Array<UMLParameter>;

  constructor(method?: UMLMethod) {
    if (method) {
      this.key = method.key;
      this.name = method.name;
      this.visibility = method.visibility;
      this.type = method.type;
      this.parameters = method.parameters;
    }
  }
}
