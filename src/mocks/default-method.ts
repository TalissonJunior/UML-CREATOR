import { UMLMethod } from '../models/uml-method';

export const createDefaultMethod = (): UMLMethod => {
  return new UMLMethod({
    name: 'Method',
    type: 'Type',
    visibility: 'public',
    parameters: [
      {
        name: 'parameter',
        type: 'Type'
      }
    ]
  });
};
