import { UMLProperty } from '../models/uml-property';

export const createDefaultProperty = (): UMLProperty => {
  return new UMLProperty({
    name: 'Property',
    type: 'Type',
    visibility: 'public'
  });
};
