import { UMLCreator } from '../app/uml-creator';

export class Link {
  source: number | UMLCreator;
  target: number | UMLCreator;

  constructor(link?: Link) {
    if (link) {
      if (link.source instanceof UMLCreator) {
        this.source = link.source.uml.key;
      } else {
        this.source = link.source;
      }

      if (link.target instanceof UMLCreator) {
        this.target = link.target.uml.key;
      } else {
        this.target = link.target;
      }
    }
  }
}
