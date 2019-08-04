import { Link } from './link';
import { UML } from './uml';

export class JsonUMLCreator {
  data: DataUML;

  constructor(nodes?: Array<UML>, links?: Array<Link>) {
    this.data = new DataUML();
    this.data.nodes = [];
    this.data.links = [];

    if (nodes) {
      this.data.nodes = nodes.map(node => new UML(node));
    }

    if (links) {
      this.data.links = links.map(node => new Link(node));
    }
  }
}

class DataUML {
  nodes: Array<UML>;
  links: Array<Link>;
}
