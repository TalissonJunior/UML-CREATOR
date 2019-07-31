export class UMLProperty {
  key?: string | number;
  name: string;
  type: string;
  visibility: string;

  constructor(property: UMLProperty) {
    if (property) {
      this.key = property.key;
      this.name = property.name;
      this.type = property.type;
      this.visibility = property.visibility;
    }
  }
}
