export class UMLParameter {
  name: string;
  type: string;

  constructor(parameter?: UMLParameter) {
    if (parameter) {
      this.name = parameter.name;
      this.type = parameter.type;
    }
  }
}
