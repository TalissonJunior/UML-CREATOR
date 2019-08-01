import { UML } from '../models/uml';
import { UMLPosition } from '../models/uml-position';

// A empty default UML
export const createDefault = (key: number, position: UMLPosition): UML => {
  return new UML({
    key: key,
    name: 'ClassName',
    methods: [
      {
        name: 'Method',
        type: 'Type',
        visibility: 'public',
        parameters: [
          {
            name: 'parameter',
            type: 'Type'
          }
        ]
      }
    ],
    properties: [
      {
        name: 'Property',
        type: 'Type',
        visibility: 'public'
      }
    ],
    position: {
      x: position.x,
      y: position.y
    }
  });
};
