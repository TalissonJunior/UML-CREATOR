import { UML } from '../models/uml';
import { UMLPosition } from '../models/uml-position';

// A empty default UML
export const createDefault = (
  key: number | string,
  position: UMLPosition
): UML => {
  return new UML({
    key: key,
    name: 'classname',
    methods: [
      {
        name: 'method',
        type: 'type',
        visibility: 'public',
        parameters: [
          {
            name: 'parameter',
            type: 'type'
          }
        ]
      }
    ],
    properties: [
      {
        name: 'property',
        type: 'type',
        visibility: 'public'
      }
    ],
    position: {
      x: position.x,
      y: position.y
    }
  });
};
